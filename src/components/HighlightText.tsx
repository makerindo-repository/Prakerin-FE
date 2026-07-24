"use client";

import React from "react";

interface HighlightTextProps {
  text?: string | null;
  highlight?: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className = "",
}) => {
  if (!text) return <>-</>;
  if (!highlight || !highlight.trim()) return <span className={className}>{text}</span>;

  const query = highlight.trim();
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-200 text-amber-900 font-bold px-1 py-0.5 rounded shadow-sm"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default HighlightText;
