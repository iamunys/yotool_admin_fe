"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FollowupsCard, FollowupsCardSkeleton } from "@/components/FollowupsCard";
import { ProspectsCard, ProspectsCardSkeleton } from "@/components/ProspectsCard";
import { UserDetailHeader, UserDetailHeaderSkeleton } from "@/components/UserDetailHeader";
import { useAdminUserDetail } from "@/hooks/useAdminUserDetail";
import type { ProspectTab } from "@/types/admin";

const PAGE_SIZE = 10;

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [prospectsTab, setProspectsTab] = useState<ProspectTab>("product");
  const [productPage, setProductPage] = useState(1);
  const [recruitmentPage, setRecruitmentPage] = useState(1);
  const [followupsPage, setFollowupsPage] = useState(1);

  const { state, retry } = useAdminUserDetail({
    userId,
    prospectsTab,
    productPage,
    recruitmentPage,
    followupsPage,
    prospectsLimit: PAGE_SIZE,
    followupsLimit: PAGE_SIZE,
  });

  const handleTabChange = (tab: ProspectTab) => setProspectsTab(tab);
  const handleProspectsPageChange = (page: number) => {
    if (prospectsTab === "product") setProductPage(page);
    else setRecruitmentPage(page);
  };

  return (
    <section aria-label="User detail" className="mx-auto max-w-4xl">
      <Link href="/users" className="dash-btn-secondary mb-5 inline-flex min-h-9 items-center gap-1.5 text-xs">
        <BackIcon className="h-3.5 w-3.5" />
        Back to Users
      </Link>

      {state.status === "loading" && (
        <div className="space-y-5">
          <UserDetailHeaderSkeleton />
          <ProspectsCardSkeleton />
          <FollowupsCardSkeleton />
        </div>
      )}

      {state.status === "not-found" && (
        <div className="card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-ink">User not found.</p>
          <p className="mt-1 text-xs text-muted">No user exists with ID {userId}.</p>
          <Link href="/users" className="dash-btn-secondary mt-6 inline-flex min-h-9">Back to Users</Link>
        </div>
      )}

      {state.status === "error" && (
        <div className="card px-6 py-16 text-center">
          <p role="alert" className="text-sm font-semibold text-ink">{state.message}</p>
          <button type="button" onClick={retry} className="dash-btn-secondary mt-4 min-h-9">
            Try again
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <div className="space-y-5" aria-busy={state.isRefreshing || undefined}>
          <UserDetailHeader user={state.user} />
          <ProspectsCard
            activeTab={prospectsTab}
            onTabChange={handleTabChange}
            list={prospectsTab === "product" ? state.product : state.recruitment}
            onPageChange={handleProspectsPageChange}
          />
          <FollowupsCard list={state.followups} onPageChange={setFollowupsPage} />
        </div>
      )}
    </section>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
