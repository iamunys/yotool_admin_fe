"use client";

import { useState } from "react";
import { Pagination } from "@/components/Pagination";
import { ProspectsEmptyState, ProspectsErrorState, ProspectsTable, ProspectsTableSkeleton } from "@/components/ProspectsTable";
import { useAdminProspects } from "@/hooks/useAdminProspects";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatStatusLabel } from "@/lib/formatDate";
import { PROSPECT_PRIORITIES, PROSPECT_STATUSES, type AdminProspectPriority, type AdminProspectType } from "@/types/admin";

const PAGE_SIZE = 20;

type SortValue = "created_at-desc" | "created_at-asc" | "updated_at-desc" | "updated_at-asc";

const sortOptions: { value: SortValue; label: string }[] = [
  { value: "created_at-desc", label: "Created (most recent)" },
  { value: "created_at-asc", label: "Created (oldest)" },
  { value: "updated_at-desc", label: "Last updated (most recent)" },
  { value: "updated_at-asc", label: "Last updated (oldest)" },
];

const typeOptions: { value: AdminProspectType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "product", label: "Product" },
  { value: "recruitment", label: "Recruitment" },
];

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  ...PROSPECT_STATUSES.map((status) => ({ value: status, label: formatStatusLabel(status) })),
];

const priorityOptions: { value: AdminProspectPriority | ""; label: string }[] = [
  { value: "", label: "All priorities" },
  ...PROSPECT_PRIORITIES.map((priority) => ({ value: priority, label: priority === "high" ? "High" : "Low" })),
];

export default function ProspectsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [prospectType, setProspectType] = useState<AdminProspectType | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<AdminProspectPriority | "">("");
  const [sort, setSort] = useState<SortValue>("created_at-desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [sortBy, sortOrder] = sort.split("-") as ["created_at" | "updated_at", "asc" | "desc"];

  // Reset to page 1 whenever a filter or sort criterion changes, without an
  // extra render: https://react.dev/learn/you-might-not-need-an-effect
  const resetKey = `${debouncedSearch}|${prospectType}|${statusFilter}|${priorityFilter}|${sort}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const { state, retry } = useAdminProspects({
    search: debouncedSearch,
    status: statusFilter,
    prospectType,
    priority: priorityFilter,
    sortBy,
    sortOrder,
    page,
    limit: PAGE_SIZE,
  });

  const hasFilters = Boolean(debouncedSearch.trim() || prospectType || statusFilter || priorityFilter);
  const clearFilters = () => {
    setSearchInput("");
    setProspectType("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  return (
    <section aria-label="Prospects">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <SearchInput value={searchInput} onChange={setSearchInput} />
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Type"
            value={prospectType}
            options={typeOptions}
            onChange={setProspectType}
          />
          <FilterSelect
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />
          <FilterSelect
            label="Priority"
            value={priorityFilter}
            options={priorityOptions}
            onChange={setPriorityFilter}
          />
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="mt-5">
        {state.status === "loading" && <ProspectsTableSkeleton />}

        {state.status === "error" && <ProspectsErrorState message={state.message} onRetry={retry} />}

        {state.status === "ready" && state.data.length === 0 && (
          <ProspectsEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        )}

        {state.status === "ready" && state.data.length > 0 && (
          <>
            <ProspectsTable prospects={state.data} />
            <Pagination
              page={state.page}
              totalPages={state.totalPages}
              total={state.total}
              onPageChange={setPage}
              itemLabel="prospect"
            />
          </>
        )}
      </div>
    </section>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <label htmlFor="prospect-search" className="sr-only">Search prospects</label>
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
        id="prospect-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by prospect name…"
        className="min-h-10 w-full rounded-full border border-line bg-surface py-2 pl-9 pr-4 text-sm font-medium outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-brand"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
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
