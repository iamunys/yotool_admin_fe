"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { AdminFollowup, AdminFollowupStatus, PaginatedList } from "@/types/admin";

export type AdminFollowupsQuery = {
  search: string;
  status: AdminFollowupStatus | "";
  sortBy: "created_at" | "due_date";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};

type AdminFollowupsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & PaginatedList<AdminFollowup>);

export function useAdminFollowups(query: AdminFollowupsQuery) {
  const { session, isLoading: isSessionLoading, signOut } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AdminFollowupsState>({ status: "loading" });
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (isSessionLoading || !session?.access_token) return;

    const controller = new AbortController();

    async function load(accessToken: string) {
      setState({ status: "loading" });

      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) {
        setState({ status: "error", message: "The admin service is not configured." });
        return;
      }

      const params = new URLSearchParams();
      if (query.search.trim()) params.set("search", query.search.trim());
      if (query.status) params.set("status", query.status);
      params.set("sortBy", query.sortBy);
      params.set("sortOrder", query.sortOrder);
      params.set("page", String(query.page));
      params.set("limit", String(query.limit));

      try {
        const response = await fetch(`${apiBaseUrl}/admin/followups?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });

        if (response.status === 403) {
          await signOut();
          router.replace("/login?forbidden=1");
          return;
        }

        if (response.status === 400) {
          let message = "One of the selected filters is invalid.";
          try {
            const body = await response.json();
            if (typeof body?.message === "string") message = body.message;
          } catch {
            // fall back to the generic message above
          }
          setState({ status: "error", message });
          return;
        }

        if (!response.ok) throw new Error("Unable to load follow-ups.");

        const body = await response.json();
        setState({
          status: "ready",
          data: Array.isArray(body?.data) ? body.data : [],
          total: typeof body?.total === "number" ? body.total : 0,
          page: typeof body?.page === "number" ? body.page : query.page,
          limit: typeof body?.limit === "number" ? body.limit : query.limit,
          totalPages: typeof body?.totalPages === "number" ? body.totalPages : 0,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "Unable to load follow-ups." });
      }
    }

    void load(session.access_token);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSessionLoading,
    session?.access_token,
    query.search,
    query.status,
    query.sortBy,
    query.sortOrder,
    query.page,
    query.limit,
    requestVersion,
  ]);

  return { state, retry: () => setRequestVersion((version) => version + 1) };
}
