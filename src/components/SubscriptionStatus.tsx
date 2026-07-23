"use client";

import React from "react";
import { Sparkles, Calendar, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionStatusProps {
  studentId?: string | null;
  onRenewClick?: () => void;
}

export function SubscriptionStatus({
  studentId,
  onRenewClick,
}: SubscriptionStatusProps) {
  const { data, tier, isPremium, isExpired, renewalDate, loading, refreshSubscription } =
    useSubscription(studentId);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 animate-pulse flex items-center justify-between">
        <div className="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded" />
        <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg" />
      </div>
    );
  }

  const formattedEndDate = data?.subscription?.subscription_end_date
    ? new Date(data.subscription.subscription_end_date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div
          className={`p-3 rounded-xl flex items-center justify-center ${
            isPremium
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-4 ring-amber-500/5"
              : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
          }`}
        >
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Status Paket:
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPremium
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {tier === "premium" ? "Premium" : "Free"}
            </span>

            {isExpired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-3 h-3" />
                Kedaluwarsa
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {isPremium
                ? `Aktif sampai: ${formattedEndDate}`
                : "Nikmati akses dasar gratis, upgrade untuk akses penuh."}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => refreshSubscription()}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh Status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {onRenewClick && (
          <button
            onClick={onRenewClick}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-sm hover:shadow transition-all"
          >
            {isPremium ? "Perpanjang Paket" : "Upgrade Premium"}
          </button>
        )}
      </div>
    </div>
  );
}
