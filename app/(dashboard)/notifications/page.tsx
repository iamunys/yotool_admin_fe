"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

type Group = "both" | "followups_only" | "reorders_only";
type Template = { id: string; group_key: Group; body: string; enabled: boolean };
type Digest = { enabled: boolean; deliveryTime: string; templates: Template[] };
const groups: { key: Group; title: string; hint: string }[] = [
  { key: "both", title: "Follow-ups and reorders", hint: "{followups}, {reorders}, optional {overdue}" },
  { key: "followups_only", title: "Follow-ups only", hint: "{followups}" },
  { key: "reorders_only", title: "Reorders only", hint: "{reorders}, optional {overdue}" },
];
function preview(body: string) {
  const counts = { followups: 3, reorders: 2, overdue: 1 };
  return body.replace(/\{(followups|reorders|overdue)\}/g, (_, key: keyof typeof counts) => String(counts[key]));
}

export default function NotificationsPage() {
  const { session } = useAuth();
  const [digest, setDigest] = useState<Digest | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const token = session?.access_token;
  const base = getApiBaseUrl();

  useEffect(() => {
    if (!token || !base) return;
    const controller = new AbortController();
    fetch(`${base}/admin/daily-digest`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load daily digest.");
        return response.json() as Promise<Digest>;
      })
      .then((value) => { setDigest(value); setError(""); })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load daily digest."); });
    return () => controller.abort();
  }, [token, base, reload]);

  const save = useCallback(async (path: string, method: "POST" | "PATCH", body: object) => {
    if (!token || !base) throw new Error("Admin session unavailable.");
    setBusy(true);
    try {
      const response = await fetch(`${base}/admin/daily-digest/templates${path}`, {
        method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(Array.isArray(result?.message) ? result.message.join(" ") : result?.message || "Unable to save template.");
      }
      setReload((value) => value + 1);
    } finally { setBusy(false); }
  }, [token, base]);

  return <section aria-label="Daily Work Digest" className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-xl font-bold text-ink">Daily Work Digest</h1><p className="text-sm text-muted">A single morning notification for due follow-ups and reorders.</p></div>
      <Link href="/notifications/compose" className="dash-btn-primary inline-flex min-h-10 items-center">Send manual notification</Link>
    </div>
    {error && <div className="card p-5" role="alert">{error} <button className="dash-btn-secondary ml-3" onClick={() => setReload((value) => value + 1)}>Retry</button></div>}
    {!digest && !error && <div className="card p-5 text-sm text-muted">Loading daily digest…</div>}
    {digest && <>
      <div className="card p-5"><div className="flex flex-wrap items-center gap-4 text-sm"><span><strong>Delivery:</strong> {digest.deliveryTime}</span><span><strong>Status:</strong> {digest.enabled ? "Enabled" : "Disabled"}</span></div><p className="mt-2 text-xs text-muted">Timing and recipient rules are fixed. Template changes affect future digests only.</p></div>
      {groups.map((group) => <div key={group.key} className="card p-5">
        <h2 className="text-base font-bold text-ink">{group.title}</h2><p className="mt-1 text-xs text-muted">Placeholders: {group.hint} · Maximum 180 characters</p>
        <div className="mt-4 space-y-4">{digest.templates.filter((item) => item.group_key === group.key).map((item) =>
          <TemplateEditor key={item.id} template={item} busy={busy} onSave={(body) => save(`/${item.id}`, "PATCH", { body })} onToggle={(enabled) => save(`/${item.id}`, "PATCH", { enabled })} />)}</div>
        <NewTemplate group={group.key} busy={busy} onAdd={(body) => save("", "POST", { group: group.key, body })} />
      </div>)}
    </>}
  </section>;
}

function TemplateEditor({ template, busy, onSave, onToggle }: { template: Template; busy: boolean; onSave: (body: string) => Promise<void>; onToggle: (enabled: boolean) => Promise<void> }) {
  const [body, setBody] = useState(template.body);
  const [error, setError] = useState("");
  return <div className="rounded-2xl border border-line p-4">
    <div className="flex items-center justify-between gap-3"><label className="text-xs font-semibold text-muted" htmlFor={`digest-${template.id}`}>Message</label><ToggleSwitch checked={template.enabled} disabled={busy} label={`Enable template ${template.id}`} onChange={(enabled) => void onToggle(enabled).catch((cause) => setError(String(cause)))} /></div>
    <textarea id={`digest-${template.id}`} rows={2} maxLength={180} value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink" />
    <p className="mt-2 text-xs text-muted">Preview (3 follow-ups, 2 reorders, 1 overdue): <span className="text-ink">{preview(body)}</span></p>
    <div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted">{template.enabled ? "Enabled" : "Disabled"}</span><button className="dash-btn-secondary min-h-8 px-3 text-xs" disabled={busy || body === template.body} onClick={() => void onSave(body).then(() => setError("")).catch((cause) => setError(String(cause)))}>Save changes</button></div>
    {error && <p role="alert" className="mt-2 text-xs text-accent">{error}</p>}
  </div>;
}

function NewTemplate({ group, busy, onAdd }: { group: Group; busy: boolean; onAdd: (body: string) => Promise<void> }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  return <div className="mt-5 border-t border-line pt-4"><label className="text-xs font-semibold text-muted" htmlFor={`new-${group}`}>Add template</label>
    <textarea id={`new-${group}`} rows={2} maxLength={180} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a Malayalam notification…" className="mt-2 w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink" />
    {body && <p className="mt-1 text-xs text-muted">Preview: <span className="text-ink">{preview(body)}</span></p>}
    <button className="dash-btn-secondary mt-2 min-h-8 px-3 text-xs" disabled={busy || !body.trim()} onClick={() => void onAdd(body).then(() => { setBody(""); setError(""); }).catch((cause) => setError(String(cause)))}>Add template</button>
    {error && <p role="alert" className="mt-2 text-xs text-accent">{error}</p>}
  </div>;
}
