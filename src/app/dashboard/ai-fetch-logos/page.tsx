"use client";

import { useState, useEffect } from "react";
import { Wand2, RefreshCw, Rocket, CheckCircle, Clock, AlertCircle } from "lucide-react";
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
  queued: number;
  remaining: number;
}

export default function AiFetchLogosPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [lastResult, setLastResult] = useState<BatchResult | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);

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
    setLastResult(null);
    try {
      const res = await API.post(ENDPOINTS.AI_FETCH_LOGOS);
      setLastResult(res.data);
      // Refresh status after queuing
      await fetchStatus();
    } catch (err) {
      if (err instanceof AxiosError) {
        await alertError(err.response?.data?.message ?? "Terjadi kesalahan.");
      }
      console.error(err);
    } finally {
      setLoadingBatch(false);
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
        ⚠️ Each click queues <strong>40 universities</strong> to Gemini with a 2-second stagger.
        Wait ~90 seconds for a batch to complete, then click again for the next one.
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

      {/* Run Button */}
      <button
        onClick={runBatch}
        disabled={loadingBatch || status?.pending === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg cursor-pointer"
      >
        {loadingBatch ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Mengantrekan batch...
          </>
        ) : status?.pending === 0 ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Semua sudah selesai!
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            🚀 Run Batch (40 universitas)
          </>
        )}
      </button>

      {/* Last Batch Result */}
      {lastResult && (
        <div
          className={`mt-4 p-4 rounded-xl border text-sm ${
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
              {lastResult.queued > 0 && (
                <p className="text-xs mt-1 opacity-75">
                  Queued: <strong>{lastResult.queued}</strong> &nbsp;|&nbsp;
                  Remaining: <strong>{lastResult.remaining.toLocaleString()}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
        <p className="font-semibold text-gray-600">How to use:</p>
        <p>1. Click <strong>Run Batch</strong> — queues 40 jobs with 2s stagger (~80s to dispatch)</p>
        <p>2. Wait ~2–3 minutes for the queue workers to process them</p>
        <p>3. Click <strong>Refresh</strong> to see updated Done/Pending counts</p>
        <p>4. Repeat until <strong>Pending = 0</strong></p>
        <p>5. Universities that Gemini couldn't find will stay Pending — upload those manually</p>
      </div>
    </main>
  );
}
