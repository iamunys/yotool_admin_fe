"use client";

import { Pagination } from "@/components/Pagination";
import { formatDate, formatStatusLabel } from "@/lib/formatDate";
import type { AdminProspectListItem, PaginatedList, ProspectTab } from "@/types/admin";

const tabs: { value: ProspectTab; label: string }[] = [
  { value: "product", label: "Product" },
  { value: "recruitment", label: "Recruitment" },
];

export function ProspectsCard({
  activeTab,
  onTabChange,
  list,
  onPageChange,
}: {
  activeTab: ProspectTab;
  onTabChange: (tab: ProspectTab) => void;
  list: PaginatedList<AdminProspectListItem>;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="text-sm font-bold text-ink">Prospects</h2>
        <TabSelect value={activeTab} onChange={onTabChange} />
      </div>

      {list.data.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm font-medium text-muted">
          No {activeTab} prospects yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <thead className="bg-surface-variant/60">
              <tr className="text-xs font-semibold text-muted">
                <th scope="col" className="px-4 py-2.5 first:pl-5">Name</th>
                <th scope="col" className="px-4 py-2.5">Status</th>
                <th scope="col" className="px-4 py-2.5 last:pr-5">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.data.map((prospect) => (
                <tr key={prospect.id}>
                  <td className="px-4 py-3 first:pl-5">
                    <p className="truncate text-sm font-semibold text-ink">{prospect.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-ink">{formatStatusLabel(prospect.status)}</span>
                  </td>
                  <td className="px-4 py-3 last:pr-5">
                    <span className="text-sm text-muted">{formatDate(prospect.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 pb-4">
        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          onPageChange={onPageChange}
          itemLabel="prospect"
        />
      </div>
    </div>
  );
}

function TabSelect({ value, onChange }: { value: ProspectTab; onChange: (tab: ProspectTab) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface-variant/50 p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
            value === tab.value ? "bg-surface text-ink shadow-soft" : "text-muted hover:text-ink"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ProspectsCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-busy="true" aria-label="Loading prospects">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="text-sm font-bold text-ink">Prospects</h2>
        <div className="h-6 w-40 animate-pulse rounded-lg bg-surface-variant" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-3.5">
            <div className="h-3.5 w-32 flex-1 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-surface-variant" />
            <div className="h-3.5 w-16 animate-pulse rounded-full bg-surface-variant" />
          </div>
        ))}
      </div>
    </div>
  );
}
