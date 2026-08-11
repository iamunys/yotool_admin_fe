export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  itemLabel = "user",
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}) {
  if (total === 0) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-4 px-1">
      <p className="text-xs font-medium text-muted">{total} {itemLabel}{total === 1 ? "" : "s"}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="dash-btn-secondary min-h-9 px-3 text-xs"
        >
          Previous
        </button>
        <p className="text-xs font-semibold text-muted">
          Page {page} of {Math.max(totalPages, 1)}
        </p>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="dash-btn-secondary min-h-9 px-3 text-xs"
        >
          Next
        </button>
      </div>
    </div>
  );
}
