"use client";

import Link from "next/link";
import { NotificationRuleCard } from "@/components/NotificationRuleCard";
import { useAdminNotificationRules } from "@/hooks/useAdminNotificationRules";
import { NOTIFICATION_RULE_TYPE_KEYS } from "@/types/admin";

export default function NotificationsPage() {
  const { state, retry, updateRule } = useAdminNotificationRules();

  return (
    <section aria-label="Notification rules">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-muted">Automated push notification rules sent to users.</p>
        <Link href="/notifications/compose" className="dash-btn-primary inline-flex min-h-10 items-center">
          Send manual notification
        </Link>
      </div>

      <div className="mt-5">
        {state.status === "loading" && <NotificationRulesSkeleton />}

        {state.status === "error" && (
          <div className="card px-6 py-16 text-center">
            <p role="alert" className="text-sm font-semibold text-ink">{state.message}</p>
            <button type="button" onClick={retry} className="dash-btn-secondary mt-4 min-h-9">
              Try again
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <div className="space-y-4">
            {NOTIFICATION_RULE_TYPE_KEYS.map((typeKey) => {
              const rule = state.data.find((row) => row.typeKey === typeKey);
              if (!rule) return null;
              return (
                <NotificationRuleCard
                  key={typeKey}
                  rule={rule}
                  onToggle={(enabled) => updateRule(typeKey, { enabled })}
                  onSaveTemplate={(messageTemplate) => updateRule(typeKey, { messageTemplate })}
                  onSaveThresholdCount={(thresholdCount) => updateRule(typeKey, { thresholdCount })}
                  onSaveThresholdDays={(thresholdDays) => updateRule(typeKey, { thresholdDays })}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function NotificationRulesSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading notification rules">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-variant" />
              <div className="h-3 w-16 animate-pulse rounded-full bg-surface-variant" />
            </div>
            <div className="h-6 w-11 animate-pulse rounded-full bg-surface-variant" />
          </div>
          <div className="mt-4 h-16 animate-pulse rounded-2xl bg-surface-variant" />
        </div>
      ))}
    </div>
  );
}
