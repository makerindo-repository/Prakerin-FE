import React from "react";

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  metric: number | string;
  metricUnit?: string;
  description: string;
  /** "positive" = green, "negative" = red, "neutral" = blue, "warning" = orange */
  status?: "positive" | "negative" | "neutral" | "warning";
  actionLabel?: string;
  onAction?: () => void;
}

const statusStyles: Record<string, { border: string; icon: string; badge: string }> = {
  positive: {
    border: "border-l-green-400",
    icon: "bg-green-100 text-green-600",
    badge: "bg-green-50 text-green-700",
  },
  negative: {
    border: "border-l-red-400",
    icon: "bg-red-100 text-red-600",
    badge: "bg-red-50 text-red-700",
  },
  warning: {
    border: "border-l-orange-400",
    icon: "bg-orange-100 text-orange-600",
    badge: "bg-orange-50 text-orange-700",
  },
  neutral: {
    border: "border-l-blue-400",
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-50 text-blue-700",
  },
};

/**
 * Insight card component for dashboard insight sections.
 * Shows a metric with icon, description, and optional action.
 */
export default function InsightCard({
  icon,
  title,
  metric,
  metricUnit,
  description,
  status = "neutral",
  actionLabel,
  onAction,
}: InsightCardProps) {
  const styles = statusStyles[status];

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${styles.border} p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`${styles.icon} p-2.5 rounded-xl flex-shrink-0`}>
          {icon}
        </div>
        <div
          className={`${styles.badge} text-xs font-bold px-2.5 py-1 rounded-full self-start whitespace-nowrap`}
        >
          {typeof metric === "number" ? metric.toLocaleString("id-ID") : metric}
          {metricUnit && <span className="ml-0.5 font-normal">{metricUnit}</span>}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-800 leading-snug">{title}</h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="self-start text-xs font-semibold text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
        >
          {actionLabel} →
        </button>
      )}
    </div>
  );
}
