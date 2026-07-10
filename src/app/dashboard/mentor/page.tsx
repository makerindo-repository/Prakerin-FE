"use client";
import { AlertCircle, Calendar, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import LoaderData from "@/components/loader";
import { API } from "@/utils/config";

interface AssignedMentor {
  id: string;
  notes: string | null;
  assigned_at: string;
  mentor: {
    id: string;
    expertise: string;
    bio: string | null;
    phone: string | null;
    availability: "available" | "limited" | "unavailable";
    user: {
      username: string;
      email: string;
    };
  };
}

const StudentMentorPage: React.FC = () => {
  const [assignment, setAssignment] = useState<AssignedMentor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMyMentor = async () => {
      setLoading(true);
      try {
        const response = await API.get("/api/v1/my-mentor", {
          headers: {
            Authorization: `Bearer ${Cookies.get("userToken")}`,
          },
        });
        setAssignment(response.data.data);
      } catch (error) {
        console.error("Error fetching my mentor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMentor();
  }, []);

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">Tersedia (Available)</span>;
      case "limited":
        return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold rounded-full">Terbatas (Limited)</span>;
      case "unavailable":
        return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-full">Sibuk (Unavailable)</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderData />
      </div>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-accent-dark text-sm mb-5">Dashboard -&gt; Guru Pembimbing</h1>

      <div className="mb-8 flex items-center space-x-2 font-extrabold text-accent">
        <ShieldCheck className="w-6 h-6" />
        <h2 className="text-2xl mt-2">Guru Pembimbing Saya</h2>
      </div>

      {!assignment ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-150 max-w-xl mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Belum Ada Pembimbing yang Ditugaskan</p>
          <p className="text-xs text-gray-400 mt-1">
            Sekolah atau Admin belum menugaskan guru pembimbing untuk Anda saat ini. Silahkan hubungi administrator sekolah Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Mentor Main Card */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-extrabold text-2xl">
                  {assignment.mentor.user.username.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">{assignment.mentor.user.username}</h3>
                  <p className="text-sm font-semibold text-accent">{assignment.mentor.expertise}</p>
                </div>
              </div>
              <div>{getAvailabilityBadge(assignment.mentor.availability)}</div>
            </div>

            {/* Bio info section */}
            <div className="space-y-2 border-t border-gray-50 pt-6">
              <h4 className="text-sm font-bold text-gray-800">Tentang Pembimbing</h4>
              <p className="text-sm text-gray-650 leading-relaxed">
                {assignment.mentor.bio || "Pembimbing belum menambahkan informasi biografi."}
              </p>
            </div>

            {/* Direct contact actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <a
                href={`mailto:${assignment.mentor.user.email}`}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-150 hover:bg-slate-50 transition-colors text-gray-700 text-sm font-bold cursor-pointer"
              >
                <Mail size={18} className="text-gray-400" />
                <span>Kirim Email</span>
              </a>

              {assignment.mentor.phone && (
                <a
                  href={`tel:${assignment.mentor.phone}`}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-150 hover:bg-slate-50 transition-colors text-gray-700 text-sm font-bold cursor-pointer"
                >
                  <Phone size={18} className="text-gray-400" />
                  <span>Hubungi via Telepon</span>
                </a>
              )}
            </div>
          </div>

          {/* Assignment Meta Card */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h4 className="font-bold text-gray-800 text-sm pb-3 border-b border-gray-50">Detail Penugasan</h4>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400">Tanggal Ditugaskan</span>
                <div className="flex items-center gap-1.5 text-gray-750 font-semibold">
                  <Calendar size={14} className="text-gray-400" />
                  <span>
                    {new Date(assignment.assigned_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-gray-400">Ditugaskan Oleh</span>
                <div className="flex items-center gap-1.5 text-gray-750 font-semibold">
                  <User size={14} className="text-gray-400" />
                  <span>{assignment.assigned_by?.username || "Sistem Admin"}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-50">
                <span className="text-gray-400">Catatan Tambahan</span>
                <p className="text-gray-650 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-normal italic">
                  {assignment.notes || "Tidak ada catatan tambahan."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default StudentMentorPage;
