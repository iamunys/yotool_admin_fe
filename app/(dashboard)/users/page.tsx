"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pagination } from "@/components/Pagination";
import { UsersEmptyState, UsersErrorState, UsersTable, UsersTableSkeleton } from "@/components/UsersTable";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { AdminUser, FollowupsView, ProspectsView } from "@/types/admin";

const PAGE_SIZE = 20;

type SortValue = "last_active_at-desc" | "last_active_at-asc" | "name-asc" | "name-desc";

const sortOptions: { value: SortValue; label: string }[] = [
  { value: "last_active_at-desc", label: "Last active (most recent)" },
  { value: "last_active_at-asc", label: "Last active (oldest)" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
];

export default function UsersPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<SortValue>("last_active_at-desc");
  const [page, setPage] = useState(1);
  const [prospectsView, setProspectsView] = useState<ProspectsView>("all");
  const [followupsView, setFollowupsView] = useState<FollowupsView>("all");

  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [sortBy, sortOrder] = sort.split("-") as ["last_active_at" | "name", "asc" | "desc"];

  // Reset to page 1 whenever the search or sort criteria change, without an
  // extra render: https://react.dev/learn/you-might-not-need-an-effect
  const resetKey = `${debouncedSearch}|${sort}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const { state, retry } = useAdminUsers({
    search: debouncedSearch,
    sortBy,
    sortOrder,
    page,
    limit: PAGE_SIZE,
  });

  const handleRowClick = (user: AdminUser) => router.push(`/users/${user.id}`);

  return (
    <section aria-label="Users">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={searchInput} onChange={setSearchInput} />
        <SortSelect value={sort} onChange={setSort} />
      </div>

      <div className="mt-5">
        {state.status === "loading" && <UsersTableSkeleton />}

        {state.status === "error" && <UsersErrorState message={state.message} onRetry={retry} />}

        {state.status === "ready" && state.data.length === 0 && (
          <UsersEmptyState hasSearch={Boolean(debouncedSearch.trim())} onClearSearch={() => setSearchInput("")} />
        )}

        {state.status === "ready" && state.data.length > 0 && (
          <>
            <UsersTable
              users={state.data}
              prospectsView={prospectsView}
              onProspectsViewChange={setProspectsView}
              followupsView={followupsView}
              onFollowupsViewChange={setFollowupsView}
              onRowClick={handleRowClick}
            />
            <Pagination page={state.page} totalPages={state.totalPages} total={state.total} onPageChange={setPage} />
          </>
        )}
      </div>
    </section>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor="user-search" className="sr-only">Search users</label>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id="user-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name or email…"
        className="min-h-10 w-full rounded-full border border-line bg-surface py-2 pl-9 pr-4 text-sm font-medium outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </div>
  );
}

function SortSelect({ value, onChange }: { value: SortValue; onChange: (value: SortValue) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
      Sort by
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortValue)}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-brand"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
