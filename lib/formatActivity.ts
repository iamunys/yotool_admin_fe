import { formatStatusLabel } from "@/lib/formatDate";

const EVENT_TYPE_LABELS: Record<string, string> = {
  prospect_created: "Created prospect",
  prospect_updated: "Updated prospect",
  prospect_status_changed: "Changed prospect status",
  prospect_deleted: "Deleted prospect",
  followup_created: "Created follow-up",
  followup_updated: "Updated follow-up",
  followup_completed: "Completed follow-up",
  followup_deleted: "Deleted follow-up",
  app_opened: "Opened app",
};

export function formatEventType(eventType: string): string {
  const known = EVENT_TYPE_LABELS[eventType];
  if (known) return known;

  return eventType
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatActivityDetail(metadata: Record<string, unknown> | null): string | null {
  if (!metadata) return null;

  if (typeof metadata.count === "number") {
    return `(${metadata.count})`;
  }

  if (typeof metadata.new_status === "string") {
    return `→ ${formatStatusLabel(metadata.new_status)}`;
  }

  return null;
}
