"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { AdminUser } from "@/types/admin";

export type PickedUser = Pick<AdminUser, "id" | "name" | "email" | "avatarUrl">;

export function AudienceUserPicker({
  selected,
  onChange,
}: {
  selected: PickedUser[];
  onChange: (users: PickedUser[]) => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const { state } = useAdminUsers({
    search: debouncedSearch,
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    limit: 8,
  });

  const selectedIds = new Set(selected.map((user) => user.id));

  const addUser = (user: AdminUser) => {
    if (selectedIds.has(user.id)) return;
    onChange([...selected, { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }]);
  };

  const removeUser = (id: string) => onChange(selected.filter((user) => user.id !== id));

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-variant/60 py-1 pl-1.5 pr-2.5 text-xs font-semibold text-ink"
            >
              <UserAvatar name={user.name} email={user.email} avatarUrl={user.avatarUrl} size={20} />
              {user.name ?? user.email}
              <button
                type="button"
                onClick={() => removeUser(user.id)}
                aria-label={`Remove ${user.name ?? user.email}`}
                className="text-muted transition hover:text-ink"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <label htmlFor="audience-search" className="sr-only">Search users</label>
      <input
        id="audience-search"
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search by name or email…"
        className="form-control"
      />

      {debouncedSearch.trim() && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-line bg-surface">
          {state.status === "loading" && <p className="px-4 py-3 text-xs font-medium text-muted">Searching…</p>}
          {state.status === "error" && (
            <p role="alert" className="px-4 py-3 text-xs font-medium text-accent">{state.message}</p>
          )}
          {state.status === "ready" && state.data.length === 0 && (
            <p className="px-4 py-3 text-xs font-medium text-muted">No users match.</p>
          )}
          {state.status === "ready" &&
            state.data.map((user) => {
              const isSelected = selectedIds.has(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  disabled={isSelected}
                  onClick={() => addUser(user)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition hover:bg-surface-variant/60 disabled:cursor-default disabled:opacity-50"
                >
                  <UserAvatar name={user.name} email={user.email} avatarUrl={user.avatarUrl} size={26} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{user.name ?? user.email}</span>
                    {user.name && <span className="block truncate text-xs text-muted">{user.email}</span>}
                  </span>
                  <span className="shrink-0 text-xs font-bold text-brand">{isSelected ? "Added" : "Add"}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
