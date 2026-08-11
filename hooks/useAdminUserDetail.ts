"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type {
  AdminFollowupListItem,
  AdminProspectListItem,
  AdminUserDetail,
  PaginatedList,
  ProspectTab,
} from "@/types/admin";

export type AdminUserDetailQuery = {
  userId: string;
  prospectsTab: ProspectTab;
  productPage: number;
  recruitmentPage: number;
  followupsPage: number;
  prospectsLimit: number;
  followupsLimit: number;
};

type AdminUserDetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-found" }
  | {
      status: "ready";
      user: AdminUserDetail;
      product: PaginatedList<AdminProspectListItem>;
      recruitment: PaginatedList<AdminProspectListItem>;
      followups: PaginatedList<AdminFollowupListItem>;
      isRefreshing: boolean;
    };

export function useAdminUserDetail(query: AdminUserDetailQuery) {
  const { session, isLoading: isSessionLoading, signOut } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AdminUserDetailState>({ status: "loading" });
  const [requestVersion, setRequestVersion] = useState(0);
  const loadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isSessionLoading || !session?.access_token) return;

    const controller = new AbortController();
    const requestedProspectsPage = query.prospectsTab === "product" ? query.productPage : query.recruitmentPage;

    async function load(accessToken: string) {
      setState((prev) =>
        prev.status === "ready" && loadedUserIdRef.current === query.userId
          ? { ...prev, isRefreshing: true }
          : { status: "loading" },
      );

      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) {
        setState({ status: "error", message: "The admin service is not configured." });
        return;
      }

      const params = new URLSearchParams();
      params.set("prospectsPage", String(requestedProspectsPage));
      params.set("prospectsLimit", String(query.prospectsLimit));
      params.set("followupsPage", String(query.followupsPage));
      params.set("followupsLimit", String(query.followupsLimit));

      try {
        const response = await fetch(`${apiBaseUrl}/admin/users/${query.userId}?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });

        if (response.status === 403) {
          await signOut();
          router.replace("/login?forbidden=1");
          return;
        }
        if (response.status === 404) {
          loadedUserIdRef.current = query.userId;
          setState({ status: "not-found" });
          return;
        }
        if (!response.ok) throw new Error("Unable to load this user.");

        const body = await response.json();
        loadedUserIdRef.current = query.userId;

        setState((prev) => {
          const prevProduct = prev.status === "ready" ? prev.product : null;
          const prevRecruitment = prev.status === "ready" ? prev.recruitment : null;
          const productMatches = requestedProspectsPage === query.productPage;
          const recruitmentMatches = requestedProspectsPage === query.recruitmentPage;

          return {
            status: "ready",
            isRefreshing: false,
            user: {
              id: body.id,
              name: body.name ?? null,
              email: body.email,
              avatarUrl: body.avatarUrl ?? null,
              lastActiveAt: body.lastActiveAt ?? null,
            },
            product: productMatches ? body.prospects.product : (prevProduct ?? body.prospects.product),
            recruitment: recruitmentMatches ? body.prospects.recruitment : (prevRecruitment ?? body.prospects.recruitment),
            followups: body.followups,
          };
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "Unable to load this user." });
      }
    }

    void load(session.access_token);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSessionLoading,
    session?.access_token,
    query.userId,
    query.prospectsTab,
    query.productPage,
    query.recruitmentPage,
    query.followupsPage,
    query.prospectsLimit,
    query.followupsLimit,
    requestVersion,
  ]);

  return { state, retry: () => setRequestVersion((version) => version + 1) };
}
