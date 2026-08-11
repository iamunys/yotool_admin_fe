"use client";

import { useState } from "react";
import { Pagination } from "@/components/Pagination";
import { ReviewsEmptyState, ReviewsErrorState, ReviewsTable, ReviewsTableSkeleton } from "@/components/ReviewsTable";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import { REVIEW_SORT_OPTIONS, type AdminReviewSortBy } from "@/types/admin";

const PAGE_SIZE = 20;

const sortOptions: { value: AdminReviewSortBy; label: string }[] = REVIEW_SORT_OPTIONS.map((value) => ({
  value,
  label: formatSortOption(value),
}));

function formatSortOption(value: AdminReviewSortBy): string {
  if (value === "mostVoted") return "Most voted";
  return "Newest";
}

export default function ReviewsPage() {
  const [sortBy, setSortBy] = useState<AdminReviewSortBy>("mostVoted");
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever sort changes, without an extra render:
  // https://react.dev/learn/you-might-not-need-an-effect
  const [prevSortBy, setPrevSortBy] = useState(sortBy);
  if (sortBy !== prevSortBy) {
    setPrevSortBy(sortBy);
    setPage(1);
  }

  const { state, retry } = useAdminReviews({ sortBy, page, limit: PAGE_SIZE });

  return (
    <section aria-label="Reviews">
      <div className="flex items-center justify-end">
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      <div className="mt-5">
        {state.status === "loading" && <ReviewsTableSkeleton />}

        {state.status === "error" && <ReviewsErrorState message={state.message} onRetry={retry} />}

        {state.status === "ready" && state.data.length === 0 && <ReviewsEmptyState />}

        {state.status === "ready" && state.data.length > 0 && (
          <>
            <ReviewsTable reviews={state.data} />
            <Pagination
              page={state.page}
              totalPages={state.totalPages}
              total={state.total}
              onPageChange={setPage}
              itemLabel="review"
            />
          </>
        )}
      </div>
    </section>
  );
}

function SortSelect({ value, onChange }: { value: AdminReviewSortBy; onChange: (value: AdminReviewSortBy) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
      Sort by
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AdminReviewSortBy)}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-brand"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
