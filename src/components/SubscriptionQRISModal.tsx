"use client";

import React from "react";
import { X, CheckCircle2, QrCode, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { usePaymentPolling } from "@/hooks/usePaymentPolling";

interface SubscriptionQRISModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
  qrCodeUrl?: string | null;
  invoiceUrl?: string | null;
  amount: number;
  packageName?: string;
  onPaymentSuccess?: () => void;
}

export function SubscriptionQRISModal({
  isOpen,
  onClose,
  invoiceId,
  qrCodeUrl,
  invoiceUrl,
  amount,
  packageName = "Monthly Premium",
  onPaymentSuccess,
}: SubscriptionQRISModalProps) {
  const { isPolling, paid, status } = usePaymentPolling({
    invoiceId,
    onSuccess: () => {
      if (onPaymentSuccess) onPaymentSuccess();
    },
  });

  if (!isOpen) return null;

  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Pembayaran QRIS
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {packageName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {paid ? (
            <div className="py-8 flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Pembayaran Berhasil!
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mb-6">
                Selamat, paket <span className="font-semibold text-gray-800 dark:text-gray-200">{packageName}</span> kamu sudah aktif!
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-md"
              >
                Mulai Gunakan Premium
              </button>
            </div>
          ) : (
            <>
              {/* Amount Badge */}
              <div className="mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Total Tagihan
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {formattedAmount}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="relative p-4 bg-white rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 shadow-inner mb-4 flex flex-col items-center">
                {qrCodeUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrCodeUrl}
                    alt="QRIS QR Code"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 flex flex-col items-center justify-center bg-gray-50 rounded-lg text-gray-400">
                    <QrCode className="w-16 h-16 mb-2 stroke-1" />
                    <span className="text-xs">Scan QR melalui Xendit</span>
                  </div>
                )}

                {/* Polling Indicator */}
                {isPolling && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200/60 dark:border-amber-900/40">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menunggu konfirmasi pembayaran...</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-4">
                Buka aplikasi e-wallet atau m-banking kamu (GoPay, OVO, ShopeePay, BCA, Mandiri, dll) lalu scan kode QRIS di atas.
              </p>

              {/* External Invoice Link fallback */}
              {invoiceUrl && (
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline mb-2"
                >
                  <span>Atau bayar via Halaman Invoice Xendit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!paid && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Otomatis terkonfirmasi</span>
            </span>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}