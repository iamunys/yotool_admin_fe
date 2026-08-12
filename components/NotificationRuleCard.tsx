"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { AdminNotificationRule } from "@/types/admin";

const LABELS: Record<AdminNotificationRule["typeKey"], string> = {
  follow_ups_today: "Follow-ups due today",
  plan_presented_reminder: "Plan presented reminder",
  stale_new_leads: "Stale new leads",
  inactive_onboarding: "Inactive user nudge",
};

const PLACEHOLDER_HINTS: Record<AdminNotificationRule["typeKey"], string> = {
  follow_ups_today: "Available placeholder: {count}",
  plan_presented_reminder: "Available placeholder: {prospect_name}",
  stale_new_leads: "Available placeholder: {count}",
  inactive_onboarding: "Available placeholder: {name}",
};

export function NotificationRuleCard({
  rule,
  onToggle,
  onSaveTemplate,
  onSaveThresholdCount,
  onSaveThresholdDays,
}: {
  rule: AdminNotificationRule;
  onToggle: (enabled: boolean) => Promise<unknown>;
  onSaveTemplate: (value: string) => Promise<unknown>;
  onSaveThresholdCount: (value: number) => Promise<unknown>;
  onSaveThresholdDays: (value: number) => Promise<unknown>;
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const handleToggle = async (next: boolean) => {
    setIsToggling(true);
    setToggleError(null);
    try {
      await onToggle(next);
    } catch (error) {
      setToggleError(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-ink">{LABELS[rule.typeKey]}</h2>
          <p className="mt-0.5 text-xs font-medium text-muted">{rule.enabled ? "Active" : "Disabled"}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ToggleSwitch
            checked={rule.enabled}
            onChange={(next) => void handleToggle(next)}
            disabled={isToggling}
            label={`Toggle ${LABELS[rule.typeKey]}`}
          />
          {toggleError && (
            <p role="alert" className="max-w-[10rem] text-right text-xs font-semibold text-accent">
              {toggleError}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <MessageTemplateField
          fieldId={`template-${rule.typeKey}`}
          initialValue={rule.messageTemplate}
          hint={PLACEHOLDER_HINTS[rule.typeKey]}
          onSave={onSaveTemplate}
        />
      </div>

      {rule.typeKey === "stale_new_leads" && (
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <ThresholdField
            fieldId={`threshold-count-${rule.typeKey}`}
            label="Minimum stale leads"
            initialValue={rule.thresholdCount ?? 1}
            min={1}
            max={1000}
            onSave={onSaveThresholdCount}
          />
          <ThresholdField
            fieldId={`threshold-days-${rule.typeKey}`}
            label="Days before considered stale"
            initialValue={rule.thresholdDays ?? 1}
            min={1}
            max={365}
            onSave={onSaveThresholdDays}
          />
        </div>
      )}
    </div>
  );
}

function MessageTemplateField({
  fieldId,
  initialValue,
  hint,
  onSave,
}: {
  fieldId: string;
  initialValue: string;
  hint: string;
  onSave: (value: string) => Promise<unknown>;
}) {
  const [value, setValue] = useState(initialValue);
  const [savedValue, setSavedValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = value !== savedValue;

  const handleSave = async () => {
    if (!value.trim()) {
      setError("Message template can't be empty.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave(value);
      setSavedValue(value);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <label htmlFor={fieldId} className="text-xs font-semibold text-muted">
        Message template
      </label>
      <textarea
        id={fieldId}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={2}
        className="mt-1.5 w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">{hint}</p>
        <div className="flex items-center gap-2">
          {justSaved && <span className="text-xs font-semibold text-brand-dark">Saved</span>}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!isDirty || isSaving}
            className="dash-btn-secondary min-h-8 px-3 py-1 text-xs"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs font-semibold text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

function ThresholdField({
  fieldId,
  label,
  initialValue,
  min,
  max,
  onSave,
}: {
  fieldId: string;
  label: string;
  initialValue: number;
  min: number;
  max: number;
  onSave: (value: number) => Promise<unknown>;
}) {
  const [value, setValue] = useState(String(initialValue));
  const [savedValue, setSavedValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const parsed = Number(value);
  const isValidNumber = value.trim() !== "" && Number.isInteger(parsed);
  const isInRange = isValidNumber && parsed >= min && parsed <= max;
  const isDirty = value !== String(savedValue);

  const handleSave = async () => {
    if (!isValidNumber || !isInRange) {
      setError(`Enter a whole number between ${min} and ${max}.`);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave(parsed);
      setSavedValue(parsed);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <label htmlFor={fieldId} className="text-xs font-semibold text-muted">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          id={fieldId}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          className="min-h-9 w-24 rounded-xl border border-line bg-surface px-3 text-sm font-semibold outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!isDirty || isSaving}
          className="dash-btn-secondary min-h-9 px-3 py-1 text-xs"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
        {justSaved && <span className="text-xs font-semibold text-brand-dark">Saved</span>}
      </div>
      <p className="mt-1 text-xs text-muted">Range: {min}–{max}</p>
      {error && (
        <p role="alert" className="mt-1 text-xs font-semibold text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
