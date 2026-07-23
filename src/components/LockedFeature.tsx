"use client";

import React from "react";
import { Lock, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface LockedFeatureProps {
  featureName: string;
  studentId?: string | null;
  children: React.ReactNode;
  onUpgrade?: () => void;
}

export function LockedFeature({
  featureName,
  studentId,
  children,
  onUpgrade,
}: LockedFeatureProps) {
  const { isPremium, loading } = useSubscription(studentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded"></div>
      </div>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-100/40 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 p-8 text-center shadow-sm">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 ring-8 ring-amber-500/5">
          <Lock className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fitur Premium</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {featureName} Terkunci
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Upgrade ke akun Premium untuk membuka akses penuh ke fitur{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{featureName}</span> dan berbagai kemudahan lainnya.
        </p>

        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade ke Premium Now</span>
          </button>
        )}
      </div>
    </div>
  );
}
