"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { AdminUser } from "@/types/admin";

export type AdminUsersQuery = {
  search: string;
  sortBy: "last_active_at" | "name";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};

type AdminUsersState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminUser[]; total: number; page: number; limit: number; totalPages: number };

export function useAdminUsers(query: AdminUsersQuery) {
  const { session, isLoading: isSessionLoading, signOut } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AdminUsersState>({ status: "loading" });
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
      params.set("sortBy", query.sortBy);
      params.set("sortOrder", query.sortOrder);
      params.set("page", String(query.page));
      params.set("limit", String(query.limit));

      try {
        const response = await fetch(`${apiBaseUrl}/admin/users?${params.toString()}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });

        if (response.status === 403) {
          await signOut();
          router.replace("/login?forbidden=1");
          return;
        }
        if (!response.ok) throw new Error("Unable to load users.");

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
        setState({ status: "error", message: error instanceof Error ? error.message : "Unable to load users." });
      }
    }

    void load(session.access_token);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSessionLoading,
    session?.access_token,
    query.search,
    query.sortBy,
    query.sortOrder,
    query.page,
    query.limit,
    requestVersion,
  ]);

  return { state, retry: () => setRequestVersion((version) => version + 1) };
}
