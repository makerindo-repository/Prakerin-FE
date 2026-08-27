import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { API, createApiCall, ENDPOINTS } from "@/utils/config";
import { alertError, alertConfirm, alertSuccess } from "@/libs/alert";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { SubscriptionQRISModal } from "./SubscriptionQRISModal";
import { useSubscription } from "@/hooks/useSubscription";

interface UpgradePremiumSectionProps {
  studentId?: string | null;
  companyId?: string | null;
  schoolId?: string | null;
  isCompany?: boolean;
  isSchool?: boolean;
}

export interface PackageItem {
  key: "monthly" | "yearly";
  name: string;
  price: number;
  period: string;
}

/**
 * Menggabungkan SubscriptionStatus + pemilihan paket + SubscriptionQRISModal
 * jadi satu alur upgrade yang utuh untuk siswa/mahasiswa, perusahaan, maupun sekolah/kampus.
 */
export default function UpgradePremiumSection({
  studentId,
  companyId,
  schoolId,
  isCompany = false,
  isSchool = false,
}: UpgradePremiumSectionProps) {
  const activeId = studentId || companyId || schoolId || null;
  const { data: subscriptionData, refreshSubscription } = useSubscription(activeId);
  const [showPicker, setShowPicker] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [statusKey, setStatusKey] = useState(0); // trik buat force-refresh SubscriptionStatus

  const [packages, setPackages] = useState<PackageItem[]>([
    { key: "monthly", name: "Monthly Premium", price: 99000, period: "/ bulan" },
    { key: "yearly", name: "Yearly Premium", price: 999000, period: "/ tahun" },
  ]);

  useEffect(() => {
    fetchPublicPrices();
  }, []);

  const fetchPublicPrices = async () => {
    try {
      const res = await API.get("/api/v1/settings/public");
      if (res.data?.data) {
        const monthly = Number(res.data.data.pro_monthly_price || 99000);
        const yearly = Number(res.data.data.pro_yearly_price || 999000);
        setPackages([
          { key: "monthly", name: "Monthly Premium", price: monthly, period: "/ bulan" },
          { key: "yearly", name: "Yearly Premium", price: yearly, period: "/ tahun" },
        ]);
      }
    } catch (e) {
      console.error("Gagal mengambil harga paket publik:", e);
    }
  };

  const [invoice, setInvoice] = useState<{
    invoiceId: string;
    invoiceUrl: string | null;
    qrCodeUrl: string | null;
    amount: number;
    packageName: string;
    expiryDate: string | null;
  } | null>(null);

  // Disimpan lepas dari `invoice` supaya masih ada walau invoice sudah null
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);

  const handleSelectPackage = async (pkg: PackageItem) => {
    if (!activeId) {
      await alertError("Data akun belum termuat. Silakan muat ulang halaman.");
      return;
    }

    setSelectedPackage(pkg);

    try {
      setCreating(pkg.key);
      const payload = schoolId
        ? { school_id: schoolId, package: pkg.key }
        : companyId
        ? { company_id: companyId, package: pkg.key }
        : { student_id: studentId || activeId, package: pkg.key };

      const res = await createApiCall<{
        invoice_id: string;
        invoice_url: string;
        qr_code_url: string | null;
        amount: number;
        package: string;
        expiry_date: string | null;
      }>(`${ENDPOINTS.SUBSCRIPTIONS}/create-payment`, {
        method: "POST",
        data: payload,
      });

      if (res?.invoice_id) {
        setShowPicker(false);
        setInvoice({
          invoiceId: res.invoice_id,
          invoiceUrl: res.invoice_url,
          qrCodeUrl: res.qr_code_url,
          amount: res.amount ?? pkg.price,
          packageName: pkg.name,
          expiryDate: res.expiry_date ?? null,
        });
        refreshSubscription();
      }
    } catch (error: any) {
      const message = error?.response?.data?.errors || "Gagal membuat invoice pembayaran.";
      await alertError(typeof message === "string" ? message : "Gagal membuat invoice pembayaran.");
    } finally {
      setCreating(null);
    }
  };

  const handleUpgradeClick = () => {
    const pending = subscriptionData?.pending_payment;

    if (pending && (pending.qr_code_url || pending.invoice_url || pending.invoice_id)) {
      const matchedPkg = packages.find((p) => p.key === pending.package);
      setSelectedPackage(matchedPkg ?? null);
      setInvoice({
        invoiceId: pending.invoice_id ?? "",
        invoiceUrl: pending.invoice_url,
        qrCodeUrl: pending.qr_code_url,
        amount: pending.amount,
        packageName: matchedPkg?.name ?? "Premium",
        expiryDate: pending.expiry_date,
      });
      return;
    }

    setShowPicker(true);
  };

  const handleCancelSubscription = async () => {
    if (!activeId) {
      await alertError("Data akun belum termuat. Silakan muat ulang halaman.");
      return;
    }

    const targetName = isCompany ? "Perusahaan" : isSchool ? "Sekolah / Kampus" : "Anda";
    const confirmed = await alertConfirm(
      "Batalkan Paket Premium",
      `Apakah Anda yakin ingin membatalkan paket langganan Premium untuk akun ${targetName}? Akses fitur Premium akan dinonaktifkan.`
    );

    if (!confirmed) return;

    try {
      setIsCancelling(true);
      const payload = schoolId
        ? { school_id: schoolId }
        : companyId
        ? { company_id: companyId }
        : { student_id: studentId || activeId };

      await createApiCall(`${ENDPOINTS.SUBSCRIPTIONS}/cancel`, {
        method: "POST",
        data: payload,
      });
      await alertSuccess("Paket langganan Premium berhasil dibatalkan.");
      setStatusKey((k) => k + 1);
      refreshSubscription();
    } catch (error: any) {
      const message = error?.response?.data?.errors || "Gagal membatalkan paket langganan.";
      await alertError(typeof message === "string" ? message : "Gagal membatalkan paket langganan.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <SubscriptionStatus
        key={statusKey}
        studentId={activeId}
        onRenewClick={handleUpgradeClick}
        onCancelClick={handleCancelSubscription}
        isCancelling={isCancelling}
      />

      {/* Modal pilih paket */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Pilih Paket Premium {isCompany ? "Perusahaan" : isSchool ? "Sekolah / Kampus" : ""}
              </h3>
              <button
                onClick={() => setShowPicker(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-3">
              {packages.map((pkg) => (
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
        expiryDate={invoice?.expiryDate ?? null}
        onRetry={() => {
          setInvoice(null);
          if (selectedPackage) handleSelectPackage(selectedPackage);
        }}
        onPaymentSuccess={() => {
          setStatusKey((k) => k + 1); // paksa SubscriptionStatus refetch status terbaru
          refreshSubscription(); // clear pending_payment supaya tidak resume invoice yang sudah lunas
        }}
      />
    </>
  );
}