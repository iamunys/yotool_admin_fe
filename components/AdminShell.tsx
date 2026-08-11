"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/components/AuthProvider";

const tabs = [
  { href: "/users", label: "Users", icon: PeopleIcon },
  { href: "/prospects", label: "Prospects", icon: ProspectsIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { session, isLoading, user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, session, pathname, router]);

  if (isLoading || !session) return <ShellLoading />;

  const activeTab = tabs.find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`));
  const pageTitle = activeTab?.label ?? "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar pathname={pathname} userEmail={user?.email ?? null} onSignOut={signOut} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 shrink-0 items-center border-b border-line bg-surface px-4 sm:px-6">
          <h1 className="truncate text-lg font-semibold text-ink">{pageTitle}</h1>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  pathname,
  userEmail,
  onSignOut,
}: {
  pathname: string;
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await onSignOut();
      router.replace("/login");
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <aside className="flex h-full w-20 shrink-0 flex-col items-center border-r border-line bg-surface">
      <Link href="/users" aria-label="Yotool Admin home" className="flex h-20 w-20 shrink-0 items-center justify-center">
        <BrandMark />
      </Link>

      <nav aria-label="Admin navigation" className="flex flex-1 flex-col items-center gap-4 py-5">
        <div className="flex flex-col items-center gap-4">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
                className={`dash-nav-item-icon group relative ${isActive ? "dash-nav-item-active" : ""}`}
              >
                <Icon className="h-5 w-5" />
                <Tooltip>{tab.label}</Tooltip>
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-3">
          {userEmail && (
            <span className="group relative grid h-9 w-9 place-items-center rounded-full bg-brand/15 text-sm font-black text-brand-dark">
              {userEmail.charAt(0).toUpperCase()}
              <Tooltip>{userEmail}</Tooltip>
            </span>
          )}
          <button
            type="button"
            aria-label="Sign out"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
            className="dash-nav-item-icon group relative disabled:cursor-wait"
          >
            <LogoutIcon className="h-5 w-5" />
            <Tooltip>Sign out</Tooltip>
          </button>
        </div>
      </nav>
    </aside>
  );
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="tooltip"
      aria-hidden="true"
      className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg border border-line bg-surface px-2 py-1 text-xs font-semibold text-ink opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

function ShellLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
    </main>
  );
}

type IconProps = { className?: string };

function PeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20c0-3.31 2.46-6 5.5-6s5.5 2.69 5.5 6" />
      <circle cx="17" cy="8.5" r="2.5" />
      <path d="M15.5 14.25c2.53.28 4.5 2.65 4.5 5.75" />
    </svg>
  );
}

function ProspectsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3.5" y="7" width="17" height="13" rx="2" />
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
      <path d="M3.5 12.5h17" />
    </svg>
  );
}

function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H9" />
      <path d="M16 16l4-4-4-4" />
      <path d="M20 12H9" />
    </svg>
  );
}
