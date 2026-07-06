import React from "react";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  /** Tailwind bg color class for the icon wrapper, e.g. "bg-teal-100" */
  iconBg?: string;
  /** Tailwind text color class for the icon, e.g. "text-teal-600" */
  iconColor?: string;
  trend?: number | null;
  trendLabel?: string;
  unit?: string;
  /** Optional extra description below the value */
  description?: string;
}

/**
 * Premium KPI card with value, icon, and optional trend indicator.
 * Used across all role-based dashboards.
 */
export default function KPICard({
  title,
  value,
  icon,
  iconBg = "bg-teal-100",
  iconColor = "text-teal-600",
  trend,
  trendLabel,
  unit,
  description,
}: KPICardProps) {
  const hasTrend = trend !== undefined && trend !== null;
  const isPositive = hasTrend && trend! >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 border border-gray-100">
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between">
        <div className={`${iconBg} ${iconColor} p-3 rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        {hasTrend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
              isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            <span>{isPositive ? "▲" : "▼"}</span>
            <span>{Math.abs(trend!)}{trendLabel ? "" : "%"}</span>
          </span>
        )}
      </div>

      {/* Value + title */}
      <div>
        <p className="text-3xl font-extrabold text-accent-dark tracking-tight">
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
          {unit && <span className="text-lg font-semibold ml-1 text-gray-400">{unit}</span>}
        </p>
        <p className="text-sm font-medium text-gray-500 mt-1 leading-tight">{title}</p>
      </div>

      {/* Trend label or description */}
      {(trendLabel || description) && (
        <p className="text-xs text-gray-400 border-t border-gray-50 pt-2">
          {hasTrend && trendLabel ? (
            <span className={isPositive ? "text-green-500" : "text-red-400"}>
              {isPositive ? "+" : ""}{trend} {trendLabel}
            </span>
          ) : (
            description
          )}
        </p>
      )}
    </div>
  );
}
