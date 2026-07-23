"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createApiCall, ENDPOINTS } from "@/utils/config";

interface PollingOptions {
  invoiceId: string | null;
  intervalMs?: number; // default 5000ms
  timeoutMs?: number; // default 30 minutes (1800000ms)
  onSuccess?: () => void;
  onFailure?: (msg: string) => void;
  onTimeout?: () => void;
}

export function usePaymentPolling({
  invoiceId,
  intervalMs = 5000,
  timeoutMs = 1800000,
  onSuccess,
  onFailure,
  onTimeout,
}: PollingOptions) {
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [paid, setPaid] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("PENDING");
  const [error, setError] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const checkStatus = useCallback(async () => {
    if (!invoiceId) return;

    // Check timeout
    if (startTimeRef.current && Date.now() - startTimeRef.current >= timeoutMs) {
      stopPolling();
      if (onTimeout) onTimeout();
      return;
    }

    try {
      const res = await createApiCall<{
        paid: boolean;
        status: string;
        message: string;
      }>(`${ENDPOINTS.SUBSCRIPTIONS}/payment-status/${invoiceId}`, {
        method: "GET",
      });

      if (res) {
        setPaid(res.paid);
        setStatus(res.status);

        if (res.paid) {
          stopPolling();
          if (onSuccess) onSuccess();
        } else if (res.status === "EXPIRED" || res.status === "FAILED") {
          stopPolling();
          if (onFailure) onFailure(res.message || "Pembayaran gagal atau kedaluwarsa.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Gagal mengecek status pembayaran");
    }
  }, [invoiceId, timeoutMs, stopPolling, onSuccess, onFailure, onTimeout]);

  useEffect(() => {
    if (invoiceId && !paid) {
      setIsPolling(true);
      startTimeRef.current = Date.now();

      // Run immediate initial check
      checkStatus();

      // Start periodic polling
      intervalRef.current = setInterval(checkStatus, intervalMs);

      return () => {
        stopPolling();
      };
    } else {
      stopPolling();
    }
  }, [invoiceId, paid, intervalMs, checkStatus, stopPolling]);

  return {
    isPolling,
    paid,
    status,
    error,
    stopPolling,
  };
}
