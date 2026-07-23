"use client";

import { useEffect, useState, useCallback } from "react";
import { API, createApiCall } from "@/utils/config";
import { isFreeFeature } from "@/config/features";

export interface SubscriptionData {
  student_id: string;
  status_subscription: "free" | "premium";
  subscription_renewed_at: string | null;
  subscription: {
    id: number;
    status: "active" | "expired" | "pending_payment";
    amount: number;
    currency: string;
    subscription_start_date: string;
    subscription_end_date: string;
    renewal_date: string;
    is_expired: boolean;
    is_renewal_due: boolean;
  } | null;
}

export function useSubscription(studentId?: string | null) {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await createApiCall<SubscriptionData>(
        `${ENDPOINTS.SUBSCRIPTIONS}/user/${studentId}`,
        { method: "GET" }
      );

      if (res && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal memuat status langganan");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const tier = data?.status_subscription || "free";
  const isPremium = tier === "premium" && data?.subscription?.status === "active";
  const isExpired = data?.subscription?.is_expired || false;
  const renewalDate = data?.subscription?.renewal_date || null;

  const canAccess = useCallback(
    (featureName: string): boolean => {
      if (isPremium) return true;
      return isFreeFeature(featureName);
    },
    [isPremium]
  );

  return {
    data,
    tier,
    isPremium,
    isExpired,
    renewalDate,
    loading,
    error,
    refreshSubscription: fetchSubscription,
    canAccess,
  };
}
