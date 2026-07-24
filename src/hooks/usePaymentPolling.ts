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

  // Simpan callback TERBARU di ref, bukan langsung dipakai di dependency array
  // useCallback/useEffect di bawah. Kalau pemanggil hook ini kirim inline arrow
  // function (mis. `onSuccess={() => ...}`), fungsi itu punya identitas BARU
  // setiap render induknya. Tanpa pola ref ini, checkStatus & useEffect ikut
  // dapat identitas baru tiap render -> effect cleanup+rerun terus-menerus ->
  // toggle isPolling false/true tanpa henti -> infinite render loop (freeze).
  const onSuccessRef = useRef(onSuccess);
  const onFailureRef = useRef(onFailure);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onFailureRef.current = onFailure;
    onTimeoutRef.current = onTimeout;
  });

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
      onTimeoutRef.current?.();
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
          onSuccessRef.current?.();
        } else if (res.status === "EXPIRED" || res.status === "FAILED") {
          stopPolling();
          onFailureRef.current?.(res.message || "Pembayaran gagal atau kedaluwarsa.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Gagal mengecek status pembayaran");
    }
  }, [invoiceId, timeoutMs, stopPolling]);

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