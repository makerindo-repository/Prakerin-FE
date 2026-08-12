"use client";

import { useState, useEffect, useRef } from "react";
import { Wand2, RefreshCw, Rocket, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { API, ENDPOINTS } from "@/utils/config";
import { alertError } from "@/libs/alert";
import { AxiosError } from "axios";

interface Status {
  total: number;
  done: number;
  pending: number;
}

interface BatchResult {
  status: string;
  message: string;
  processed: number;
  succeeded: number;
  remaining: number;
  results: { name: string; success: boolean; reason: string }[];
}

export default function AiFetchLogosPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [lastResult, setLastResult] = useState<BatchResult | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await API.get(ENDPOINTS.AI_FETCH_LOGOS_STATUS);
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const runBatch = async () => {
    setLoadingBatch(true);
    setCancelled(false);
    setLastResult(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await API.post(ENDPOINTS.AI_FETCH_LOGOS, {}, {
        signal: controller.signal,
      });
      setLastResult(res.data);
      await fetchStatus();
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === "ERR_CANCELED") {
          // User cancelled — don't show alert, just note it
          setCancelled(true);
        } else {
          await alertError(err.response?.data?.message ?? "Terjadi kesalahan.");
        }
      }
      console.error(err);
    } finally {
      setLoadingBatch(false);
      abortControllerRef.current = null;
    }
  };

  const cancelBatch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const progressPct =
    status && status.total > 0
      ? Math.round((status.done / status.total) * 100)
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
        ⚠️ Each click processes <strong>5 universities</strong> synchronously (inline, no queue needed).
        Click repeatedly to work through all {status?.pending?.toLocaleString() ?? "..."} pending.
      </p>

      {/* Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Progress</h2>
          <button
            onClick={fetchStatus}
            disabled={loadingStatus}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {status ? (
          <>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right mb-4">{progressPct}% selesai</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-700">{status.total.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-2xl font-bold text-green-600">{status.done.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-400">Done</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <p className="text-2xl font-bold text-orange-500">{status.pending.toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-400">Pending</p>
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

      {/* Run + Cancel Buttons */}
      <div className="flex gap-3">
        <button
          onClick={runBatch}
          disabled={loadingBatch || status?.pending === 0}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          {loadingBatch ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Processing 5 universities...
            </>
          ) : status?.pending === 0 ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Semua sudah selesai!
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              🚀 Process Next 5 Universities
            </>
          )}
        </button>

        {/* Cancel — only visible while a batch is running */}
        {loadingBatch && (
          <button
            onClick={cancelBatch}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      {/* Cancelled notice */}
      {cancelled && !loadingBatch && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          Request dibatalkan. Beberapa universitas mungkin sudah diproses sebelum dibatalkan. Klik Refresh untuk cek progress terbaru.
        </div>
      )}

      {/* Last Batch Result */}
      {lastResult && (
        <div className="mt-4 space-y-3">
          {/* Summary */}
          <div
            className={`p-4 rounded-xl border text-sm ${
              lastResult.status === "done"
                ? "bg-green-50 border-green-200 text-green-700"
                : lastResult.status === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {lastResult.status === "error" ? (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{lastResult.message}</p>
                {lastResult.processed > 0 && (
                  <p className="text-xs mt-1 opacity-75">
                    Processed: <strong>{lastResult.processed}</strong> &nbsp;|&nbsp;
                    Succeeded: <strong>{lastResult.succeeded}</strong> &nbsp;|&nbsp;
                    Failed: <strong>{lastResult.processed - lastResult.succeeded}</strong> &nbsp;|&nbsp;
                    Remaining: <strong>{lastResult.remaining.toLocaleString()}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Per-university breakdown */}
          {lastResult.results && lastResult.results.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {lastResult.results.map((r, i) => (
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
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
        <p className="font-semibold text-gray-600">How to use:</p>
        <p>1. Click <strong>Process Next 5</strong> — runs synchronously, takes ~10–30 seconds</p>
        <p>2. See the per-university result breakdown below the button</p>
        <p>3. Click again for the next 5. Keep going until <strong>Pending = 0</strong></p>
        <p>4. Universities that Gemini couldn&apos;t find stay Pending — upload those manually</p>
      </div>
    </main>
  );
}
