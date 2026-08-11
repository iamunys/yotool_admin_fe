"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { AdminReview, AdminReviewSortBy, PaginatedList } from "@/types/admin";

export type AdminReviewsQuery = {
  sortBy: AdminReviewSortBy;
  page: number;
  limit: number;
};

// Display-friendly review: `author` already resolves to "Anonymous" on the
// backend when isAnonymous is true, so it's used as-is rather than
// reconstructed from user.first_name/last_name. authorName is derived here
// so components don't need to reach into the raw `user`/`author` fields.
export type AdminReviewWithAuthor = AdminReview & { authorName: string };

type AdminReviewsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & PaginatedList<AdminReviewWithAuthor>);

function withAuthorName(review: AdminReview): AdminReviewWithAuthor {
  return { ...review, authorName: review.author };
}

export function useAdminReviews(query: AdminReviewsQuery) {
  const { session, isLoading: isSessionLoading, signOut } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AdminReviewsState>({ status: "loading" });
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
      params.set("sortBy", query.sortBy);
      params.set("page", String(query.page));
      params.set("limit", String(query.limit));

      try {
        const response = await fetch(`${apiBaseUrl}/admin/reviews?${params.toString()}`, {
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

        if (!response.ok) throw new Error("Unable to load reviews.");

        const body = await response.json();
        const data: AdminReview[] = Array.isArray(body?.data) ? body.data : [];
        setState({
          status: "ready",
          data: data.map(withAuthorName),
          total: typeof body?.total === "number" ? body.total : 0,
          page: typeof body?.page === "number" ? body.page : query.page,
          limit: typeof body?.limit === "number" ? body.limit : query.limit,
          totalPages: typeof body?.totalPages === "number" ? body.totalPages : 0,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "Unable to load reviews." });
      }
    }

    void load(session.access_token);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSessionLoading,
    session?.access_token,
    query.sortBy,
    query.page,
    query.limit,
    requestVersion,
  ]);

  return { state, retry: () => setRequestVersion((version) => version + 1) };
}
