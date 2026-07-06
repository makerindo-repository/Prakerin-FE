import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

/**
 * Reusable section header with title, optional subtitle, and optional action link.
 */
export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4 gap-2">
      <div>
        <h3 className="font-bold text-base text-accent-dark">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {actionLabel && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors flex-shrink-0 mt-0.5"
            >
              {actionLabel}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors flex-shrink-0 mt-0.5"
            >
              {actionLabel}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
