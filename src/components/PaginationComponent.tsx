import React from "react";

interface PaginationProps {
  activePage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  disabled?: boolean;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  activePage,
  totalPages,
  onPageChange,
  loading,
  disabled = false,
}) => {
  const safeTotalPages =
    typeof totalPages === "number" && !isNaN(totalPages)
      ? Math.max(1, totalPages)
      : 1;

  if (safeTotalPages <= 1 || disabled) return null;

  const getPageItems = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }

    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const pageItems = getPageItems(activePage, safeTotalPages);

  return (
    <div className="flex items-center justify-center sm:justify-end gap-1 mt-6 flex-wrap">
      {/* Previous Button */}
      <button
        className="h-9 px-3 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        disabled={loading || activePage <= 1}
        onClick={() => onPageChange(activePage - 1)}
        title="Halaman Sebelumnya"
      >
        &lt;
      </button>

      {/* Page Numbers */}
      {pageItems.map((item, index) => {
        if (typeof item === "string") {
          const isLeftEllipsis = index === 1;
          const targetPage = isLeftEllipsis
            ? Math.max(1, activePage - 4)
            : Math.min(safeTotalPages, activePage + 4);

          return (
            <button
              key={`ellipsis-${index}`}
              onClick={() => !loading && onPageChange(targetPage)}
              disabled={loading}
              className="h-9 px-2 text-xs font-semibold text-gray-500 hover:text-accent hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title={isLeftEllipsis ? "Lompat mundur" : "Lompat maju"}
            >
              ...
            </button>
          );
        }

        const isCurrent = item === activePage;

        return (
          <button
            key={`page-${item}`}
            disabled={loading}
            onClick={() => onPageChange(item)}
            className={`h-9 min-w-[36px] px-2 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
              isCurrent
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        className="h-9 px-3 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        disabled={loading || activePage >= safeTotalPages}
        onClick={() => onPageChange(activePage + 1)}
        title="Halaman Selanjutnya"
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationComponent;
