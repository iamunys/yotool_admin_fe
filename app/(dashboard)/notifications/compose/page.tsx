"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AudienceUserPicker, type PickedUser } from "@/components/AudienceUserPicker";
import { useAuth } from "@/components/AuthProvider";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { SendNotificationResult } from "@/types/admin";

type AudienceMode = "all" | "specific";

type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success"; result: SendNotificationResult }
  | { status: "error"; message: string };

export default function ComposeNotificationPage() {
  const { session, signOut } = useAuth();
  const router = useRouter();

  const [audienceMode, setAudienceMode] = useState<AudienceMode>("specific");
  const [selectedUsers, setSelectedUsers] = useState<PickedUser[]>([]);
  const [message, setMessage] = useState("");
  const [allUsersAcknowledged, setAllUsersAcknowledged] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendState, setSendState] = useState<SendState>({ status: "idle" });

  const canSend =
    message.trim().length > 0 &&
    (audienceMode === "all" ? allUsersAcknowledged : selectedUsers.length > 0);

  const confirmDescription =
    audienceMode === "all"
      ? "Send to all users? This is immediate and can't be undone."
      : `Send to ${selectedUsers.length} selected user${selectedUsers.length === 1 ? "" : "s"}? This is immediate and can't be undone.`;

  const handleSend = async () => {
    if (!session?.access_token) return;
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      setSendState({ status: "error", message: "The admin service is not configured." });
      return;
    }

    setSendState({ status: "sending" });
    try {
      const response = await fetch(`${apiBaseUrl}/admin/notifications/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audience: audienceMode === "all" ? "all" : selectedUsers.map((user) => user.id),
          message: message.trim(),
        }),
      });

      if (response.status === 403) {
        await signOut();
        router.replace("/login?forbidden=1");
        return;
      }

      if (!response.ok) {
        let errorMessage = "Unable to send the notification.";
        try {
          const body = await response.json();
          if (typeof body?.message === "string") errorMessage = body.message;
          else if (Array.isArray(body?.message)) errorMessage = body.message.join(" ");
        } catch {
          // fall back to the generic message above
        }
        throw new Error(errorMessage);
      }

      const body = await response.json();
      setSendState({
        status: "success",
        result: {
          recipients: typeof body?.recipients === "number" ? body.recipients : 0,
          sent: typeof body?.sent === "number" ? body.sent : 0,
        },
      });
    } catch (error) {
      setSendState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to send the notification.",
      });
    } finally {
      setShowConfirm(false);
    }
  };

  const resetForm = () => {
    setMessage("");
    setSelectedUsers([]);
    setAudienceMode("specific");
    setAllUsersAcknowledged(false);
    setSendState({ status: "idle" });
  };

  const handleAudienceModeChange = (mode: AudienceMode) => {
    setAudienceMode(mode);
    setAllUsersAcknowledged(false);
  };

  if (sendState.status === "success") {
    return (
      <section aria-label="Send notification" className="mx-auto max-w-xl">
        <div className="card p-8 text-center">
          <h2 className="text-base font-bold text-ink">Notification sent</h2>
          <p className="mt-2 text-sm font-medium text-muted">
            Delivered to {sendState.result.sent} of {sendState.result.recipients} eligible recipients.
          </p>
          <button type="button" onClick={resetForm} className="dash-btn-primary mt-6 min-h-10">
            Send another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Send notification" className="mx-auto max-w-xl">
      <div className="card p-6">
        <h2 className="text-sm font-bold text-ink">Audience</h2>
        <div role="radiogroup" aria-label="Audience" className="mt-3 flex gap-3">
          <AudienceModeButton mode="all" current={audienceMode} onSelect={handleAudienceModeChange} label="All users" />
          <AudienceModeButton mode="specific" current={audienceMode} onSelect={handleAudienceModeChange} label="Specific users" />
        </div>

        {audienceMode === "specific" && (
          <div className="mt-4">
            <AudienceUserPicker selected={selectedUsers} onChange={setSelectedUsers} />
          </div>
        )}

        {audienceMode === "all" && (
          <label className="mt-4 flex items-start gap-2.5 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={allUsersAcknowledged}
              onChange={(event) => setAllUsersAcknowledged(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-brand focus:ring-brand/40"
            />
            I understand this will send to every user.
          </label>
        )}

        <h2 className="mt-6 text-sm font-bold text-ink">Message</h2>
        <label htmlFor="compose-message" className="sr-only">Notification message</label>
        <textarea
          id="compose-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          placeholder="Write the notification message…"
          className="mt-3 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/15"
        />

        {sendState.status === "error" && (
          <p role="alert" className="mt-3 text-sm font-semibold text-accent">{sendState.message}</p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={!canSend}
            onClick={() => setShowConfirm(true)}
            className="dash-btn-primary min-h-10"
          >
            Send
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Send notification"
          description={confirmDescription}
          confirmLabel="Send"
          isConfirming={sendState.status === "sending"}
          onConfirm={() => void handleSend()}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </section>
  );
}

function AudienceModeButton({
  mode,
  current,
  onSelect,
  label,
}: {
  mode: AudienceMode;
  current: AudienceMode;
  onSelect: (mode: AudienceMode) => void;
  label: string;
}) {
  const isActive = mode === current;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={() => onSelect(mode)}
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        isActive ? "border-brand bg-brand/10 text-brand-dark" : "border-line text-ink hover:bg-surface-variant"
      }`}
    >
      {label}
    </button>
  );
}
