import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { createApiCall } from "@/utils/config";
import { Activity, RefreshCw } from "lucide-react";

interface ActivityLogData {
  id: string;
  action: string;
  resource_type: string;
  resource_name: string | null;
  description: string | null;
  created_at: string;
}

interface Props {
  resourceType?: string;
  userId?: string;
  title?: string;
}

export default function FeatureActivityLog({ resourceType, userId, title = "Riwayat Aktivitas" }: Props) {
  const [logs, setLogs] = useState<ActivityLogData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${Cookies.get("userToken")}` };
      const params: any = { page: 1, limit: 5 }; // Only get the latest 5 logs for this widget
      if (resourceType) params.resource_type = resourceType;
      if (userId) params.user_id = userId;

      const queryString = new URLSearchParams(params).toString();
      const res = await createApiCall({
        url: `/activity-logs?${queryString}`,
        headers
      });

      setLogs(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch feature logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [resourceType, userId]);

  const getActionBadgeColor = (act: string) => {
    switch (act.toLowerCase()) {
      case "login":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "logout":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "create":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "update":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "delete":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#035a70]" />
          {title}
        </h3>
        <button
          onClick={fetchLogs}
          className="text-xs text-gray-500 hover:text-[#035a70] flex items-center gap-1 transition-colors bg-gray-50 px-2 py-1 rounded"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Segarkan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <RefreshCw className="w-6 h-6 text-[#035a70] animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          Belum ada riwayat aktivitas.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border rounded-full ${getActionBadgeColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="font-semibold text-gray-700 text-sm">{log.description || "Aktivitas Tercatat"}</span>
                </div>
                {log.resource_name && (
                  <span className="text-xs text-gray-400 mt-1 pl-[2px]">
                    ({log.resource_name})
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 font-medium text-right mt-2 sm:mt-0">
                {new Date(log.created_at).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
