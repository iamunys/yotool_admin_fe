"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { AdminActivityListItem, PaginatedList } from "@/types/admin";

export type AdminUserActivityQuery = {
  userId: string;
  page: number;
  limit: number;
};

type AdminUserActivityState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & PaginatedList<AdminActivityListItem>);

export function useAdminUserActivity(query: AdminUserActivityQuery) {
  const { session, isLoading: isSessionLoading, signOut } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AdminUserActivityState>({ status: "loading" });
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
      params.set("page", String(query.page));
      params.set("limit", String(query.limit));

      try {
        const response = await fetch(
          `${apiBaseUrl}/admin/users/${query.userId}/activity?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          },
        );

        if (response.status === 403) {
          await signOut();
          router.replace("/login?forbidden=1");
          return;
        }
        if (!response.ok) throw new Error("Unable to load activity.");

        const body = await response.json();
        const rows: unknown[] = Array.isArray(body?.data) ? body.data : [];

        setState({
          status: "ready",
          data: rows.map((row) => {
            const item = row as Record<string, unknown>;
            return {
              eventType: typeof item.event_type === "string" ? item.event_type : "unknown",
              entityId: typeof item.entity_id === "string" ? item.entity_id : null,
              metadata: (item.metadata as Record<string, unknown> | null) ?? null,
              createdAt: typeof item.created_at === "string" ? item.created_at : null,
            };
          }),
          total: typeof body?.total === "number" ? body.total : 0,
          page: typeof body?.page === "number" ? body.page : query.page,
          limit: typeof body?.limit === "number" ? body.limit : query.limit,
          totalPages: typeof body?.totalPages === "number" ? body.totalPages : 0,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "Unable to load activity." });
      }
    }

    void load(session.access_token);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionLoading, session?.access_token, query.userId, query.page, query.limit, requestVersion]);

  return { state, retry: () => setRequestVersion((version) => version + 1) };
}
