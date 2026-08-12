"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Wand2, RefreshCw, Rocket, CheckCircle, Clock,
  AlertCircle, XCircle, Play, Square,
} from "lucide-react";
import { API, ENDPOINTS } from "@/utils/config";
import { AxiosError } from "axios";

interface Status {
  total: number;
  done: number;
  failed: number;
  pending: number;
}

interface UniversityResult {
  name: string;
  success: boolean;
  reason: string;
}

interface BatchResult {
  status: string;
  message: string;
  processed: number;
  succeeded: number;
  remaining: number;
  results: UniversityResult[];
}

export default function AiFetchLogosPage() {
  const [status, setStatus]               = useState<Status | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingBatch, setLoadingBatch]   = useState(false);
  const [autoRun, setAutoRun]             = useState(false);
  const [cancelled, setCancelled]         = useState(false);
  const [log, setLog]                     = useState<UniversityResult[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const autoRunRef          = useRef(false);

  const fetchStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await API.get(ENDPOINTS.AI_FETCH_LOGOS_STATUS);
      setStatus(res.data);
      return res.data as Status;
    } catch {
      return null;
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  // Process exactly 1 university. Returns remaining count (or -1 on cancel/error).
  const processOne = useCallback(async (): Promise<number> => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await API.post(ENDPOINTS.AI_FETCH_LOGOS, {}, {
        signal: controller.signal,
        timeout: 90000, // 90s — overrides global axios timeout for this call
      });
      const data = res.data as BatchResult;

      if (data.results?.length) {
        setLog(prev => [...data.results, ...prev].slice(0, 50));
      }

      // Fetch fresh stats to display correct done/failed/pending values
      const freshStatus = await fetchStatus();
      return freshStatus ? freshStatus.pending : data.remaining;
    } catch (err) {
      if (err instanceof AxiosError && err.code === "ERR_CANCELED") {
        setCancelled(true);
      }
      return -1;
    } finally {
      abortControllerRef.current = null;
    }
  }, [fetchStatus]);

  const runLoop = useCallback(async () => {
    setLoadingBatch(true);
    setCancelled(false);

    while (autoRunRef.current) {
      const remaining = await processOne();
      if (remaining === -1 || remaining === 0) break;
      await new Promise(r => setTimeout(r, 500));
    }

    setLoadingBatch(false);
    setAutoRun(false);
    autoRunRef.current = false;
    fetchStatus();
  }, [processOne, fetchStatus]);

  const toggleAutoRun = () => {
    if (autoRun) {
      autoRunRef.current = false;
      setAutoRun(false);
      abortControllerRef.current?.abort();
    } else {
      autoRunRef.current = true;
      setAutoRun(true);
      runLoop();
    }
  };

  const runOne = async () => {
    if (loadingBatch) return;
    setLoadingBatch(true);
    setCancelled(false);
    await processOne();
    setLoadingBatch(false);
    fetchStatus();
  };

  useEffect(() => {
    fetchStatus();
    return () => { autoRunRef.current = false; };
  }, [fetchStatus]);

  const progressPct =
    status && status.total > 0
      ? Math.round(((status.done + status.failed) / status.total) * 100)
      : 0;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-violet-100 rounded-xl">
          <Wand2 className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">AI Auto Fetch University Logos</h1>
          <p className="text-xs text-gray-400">
            Temporary admin tool — delete this page after all logos are uploaded.
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
        ⚠️ Processes <strong>1 university per request</strong> (~5–20s each).
        Use <strong>Auto-Run</strong> to process continuously hands-free.
      </p>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Progress</h2>
          <button
            onClick={() => fetchStatus()}
            disabled={loadingStatus}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {status ? (
          <>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-1 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right mb-4">{progressPct}% selesai</p>

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-xl font-bold text-gray-700">{status.total.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
              </div>
              <div className="bg-green-50 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <p className="text-xl font-bold text-green-600">{status.done.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-gray-400">Succeeded</p>
              </div>
              <div className="bg-red-50 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <p className="text-xl font-bold text-red-600">{status.failed.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-gray-400">Failed</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <p className="text-xl font-bold text-orange-500">{status.pending.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-gray-400">Pending</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading status...</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-3">
        <button
          onClick={toggleAutoRun}
          disabled={status?.pending === 0}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            autoRun
              ? "text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
              : "text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 hover:shadow-lg"
          }`}
        >
          {autoRun ? (
            <><Square className="w-4 h-4" /> Stop Auto-Run</>
          ) : status?.pending === 0 ? (
            <><CheckCircle className="w-4 h-4" /> Semua sudah selesai!</>
          ) : (
            <><Play className="w-4 h-4" /> ▶ Auto-Run</>
          )}
        </button>

        {/* Manual ×1 button */}
        <button
          onClick={runOne}
          disabled={loadingBatch || status?.pending === 0}
          title="Process 1 manually"
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-violet-600 bg-violet-50 border border-violet-200 hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <Rocket className="w-4 h-4" />
          {loadingBatch && !autoRun ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "×1"}
        </button>
      </div>

      {/* Auto-run indicator */}
      {autoRun && (
        <div className="flex items-center gap-2 text-sm text-violet-600 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-3">
          <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
          Auto-Run aktif — memproses universitas satu per satu secara otomatis...
        </div>
      )}

      {/* Cancelled notice */}
      {cancelled && !loadingBatch && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          Dibatalkan. Progress yang sudah selesai tetap tersimpan.
        </div>
      )}

      {/* Running log */}
      {log.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">Log Terbaru</p>
            <button
              onClick={() => setLog([])}
              className="text-xs text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {log.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                {r.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                <span className="font-medium text-gray-700 flex-1 truncate">{r.name}</span>
                <span className="text-xs text-gray-400 truncate max-w-[200px]">{r.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
        <p className="font-semibold text-gray-600">How to use:</p>
        <p>1. Click <strong>▶ Auto-Run</strong> — processes 1 university at a time, automatically continues</p>
        <p>2. Watch the log fill up in real-time as each university is processed</p>
        <p>3. Click <strong>Stop Auto-Run</strong> to pause anytime</p>
        <p>4. Use <strong>×1</strong> to manually step through one at a time</p>
        <p>5. Universities Gemini can&apos;t find stay Pending — upload those manually</p>
      </div>
    </main>
  );
}
