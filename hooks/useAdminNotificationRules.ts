"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { AdminNotificationRule, NotificationRuleTypeKey } from "@/types/admin";

type AdminNotificationRulesState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminNotificationRule[] };

export type UpdateNotificationRulePatch = {
  enabled?: boolean;
  messageTemplate?: string;
  thresholdCount?: number;
  thresholdDays?: number;
};

function mapRule(row: Record<string, unknown>): AdminNotificationRule {
  return {
    typeKey: row.type_key as NotificationRuleTypeKey,
    enabled: Boolean(row.enabled),
    messageTemplate: typeof row.message_template === "string" ? row.message_template : "",
    thresholdCount: typeof row.threshold_count === "number" ? row.threshold_count : null,
    thresholdDays: typeof row.threshold_days === "number" ? row.threshold_days : null,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") return body.message;
    if (Array.isArray(body?.message)) return body.message.join(" ");
  } catch {
    // fall back to the generic message below
  }
  return fallback;
}

export function useAdminNotificationRules() {
  const { session, isLoading: isSessionLoading, signOut } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AdminNotificationRulesState>({ status: "loading" });
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

      try {
        const response = await fetch(`${apiBaseUrl}/admin/notification-rules`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: controller.signal,
        });

        if (response.status === 403) {
          await signOut();
          router.replace("/login?forbidden=1");
          return;
        }
        if (!response.ok) throw new Error("Unable to load notification rules.");

        const body = await response.json();
        const rows: unknown[] = Array.isArray(body) ? body : [];
        setState({ status: "ready", data: rows.map((row) => mapRule(row as Record<string, unknown>)) });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load notification rules.",
        });
      }
    }

    void load(session.access_token);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionLoading, session?.access_token, requestVersion]);

  const updateRule = useCallback(
    async (typeKey: NotificationRuleTypeKey, patch: UpdateNotificationRulePatch) => {
      if (!session?.access_token) throw new Error("Not authenticated.");
      const apiBaseUrl = getApiBaseUrl();
      if (!apiBaseUrl) throw new Error("The admin service is not configured.");

      let previous: AdminNotificationRule[] | null = null;
      setState((current) => {
        if (current.status !== "ready") return current;
        previous = current.data;
        return {
          status: "ready",
          data: current.data.map((rule) => (rule.typeKey === typeKey ? { ...rule, ...patch } : rule)),
        };
      });

      try {
        const response = await fetch(`${apiBaseUrl}/admin/notification-rules/${typeKey}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patch),
        });

        if (response.status === 403) {
          await signOut();
          router.replace("/login?forbidden=1");
          throw new Error("Admin access is required.");
        }
        if (!response.ok) throw new Error(await readErrorMessage(response, "Unable to save this change."));

        const body = await response.json();
        const updated = mapRule(body as Record<string, unknown>);
        setState((current) =>
          current.status === "ready"
            ? { status: "ready", data: current.data.map((rule) => (rule.typeKey === typeKey ? updated : rule)) }
            : current,
        );
        return updated;
      } catch (error) {
        if (previous) {
          const rolledBack = previous;
          setState({ status: "ready", data: rolledBack });
        }
        throw error;
      }
    },
    [session, signOut, router],
  );

  return { state, retry: () => setRequestVersion((version) => version + 1), updateRule };
}
