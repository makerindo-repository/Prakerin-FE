"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { createApiCall, ENDPOINTS } from "@/utils/config";
import { alertError } from "@/libs/alert";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { SubscriptionQRISModal } from "./SubscriptionQRISModal";

interface UpgradePremiumSectionProps {
  studentId: string | null;
}

const PACKAGES = [
  { key: "monthly", name: "Monthly Premium", price: 99000, period: "/ bulan" },
  { key: "yearly", name: "Yearly Premium", price: 999000, period: "/ tahun" },
] as const;

/**
 * Menggabungkan SubscriptionStatus + pemilihan paket + SubscriptionQRISModal
 * jadi satu alur upgrade yang utuh untuk siswa/mahasiswa.
 */
export default function UpgradePremiumSection({ studentId }: UpgradePremiumSectionProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [statusKey, setStatusKey] = useState(0); // trik buat force-refresh SubscriptionStatus

  const [invoice, setInvoice] = useState<{
    invoiceId: string;
    invoiceUrl: string | null;
    qrCodeUrl: string | null;
    amount: number;
    packageName: string;
  } | null>(null);

  const handleSelectPackage = async (pkg: (typeof PACKAGES)[number]) => {
    if (!studentId) {
      await alertError("Data siswa belum termuat. Silakan muat ulang halaman.");
      return;
    }

    try {
      setCreating(pkg.key);
      const res = await createApiCall<{
        invoice_id: string;
        invoice_url: string;
        qr_code_url: string | null;
        amount: number;
        package: string;
      }>(`${ENDPOINTS.SUBSCRIPTIONS}/create-payment`, {
        method: "POST",
        data: { student_id: studentId, package: pkg.key },
      });

      if (res?.invoice_id) {
        setShowPicker(false);
        setInvoice({
          invoiceId: res.invoice_id,
          invoiceUrl: res.invoice_url,
          qrCodeUrl: res.qr_code_url,
          amount: res.amount ?? pkg.price,
          packageName: pkg.name,
        });
      }
    } catch (error: any) {
      const message = error?.response?.data?.errors || "Gagal membuat invoice pembayaran.";
      await alertError(typeof message === "string" ? message : "Gagal membuat invoice pembayaran.");
    } finally {
      setCreating(null);
    }
  };

  return (
    <>
      <SubscriptionStatus
        key={statusKey}
        studentId={studentId}
        onRenewClick={() => setShowPicker(true)}
      />

      {/* Modal pilih paket */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Pilih Paket Premium</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-3">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.key}
                  disabled={creating !== null}
                  onClick={() => handleSelectPackage(pkg)}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors text-left disabled:opacity-60"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{pkg.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(pkg.price)}{" "}
                      {pkg.period}
                    </p>
                  </div>
                  {creating === pkg.key ? (
                    <span className="text-xs text-amber-600 font-medium">Memproses...</span>
                  ) : (
                    <Check className="w-5 h-5 text-gray-300" />
                  )}
                </button>
              ))}
              <p className="text-xs text-gray-400 text-center mt-1">
                Pembayaran via QRIS — bisa pakai e-wallet atau m-banking apa saja.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR pembayaran */}
      <SubscriptionQRISModal
        isOpen={invoice !== null}
        onClose={() => setInvoice(null)}
        invoiceId={invoice?.invoiceId ?? null}
        qrCodeUrl={invoice?.qrCodeUrl}
        invoiceUrl={invoice?.invoiceUrl}
        amount={invoice?.amount ?? 0}
        packageName={invoice?.packageName}
        onPaymentSuccess={() => {
          setStatusKey((k) => k + 1); // paksa SubscriptionStatus refetch status terbaru
        }}
      />
    </>
  );
}