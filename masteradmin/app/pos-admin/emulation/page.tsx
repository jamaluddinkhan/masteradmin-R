"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleHelp, LogOut, Store } from "lucide-react";
import {
  clearEmulationSession,
  readEmulationSession,
  type EmulationSession,
} from "@/src/lib/emulation-session";

export default function POSAdminEmulationPage() {
  const router = useRouter();
  const [session, setSession] = useState<EmulationSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sessionTimer = window.setTimeout(() => {
      const activeSession = readEmulationSession();
      if (!activeSession) {
        router.replace("/master");
        return;
      }

      setSession(activeSession);
      setReady(true);
    }, 0);

    return () => window.clearTimeout(sessionTimer);
  }, [router]);

  function exitEmulation() {
    if (!session) return;
    const returnDestination = session.returnDestination;
    clearEmulationSession();
    router.replace(returnDestination);
  }

  if (!ready || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-admin-background px-4">
        <div className="admin-loading-content text-sm text-admin-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-admin-border border-t-admin-primary" />
          Opening demo workspace...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-admin-background">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 bg-admin-primary px-4 py-3 text-white sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
            <CircleHelp className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold sm:text-base">
              Support Mode — You are accessing {session.posAdminName}
            </div>
            <div className="truncate text-xs text-white/80">{session.posAdminEmail}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={exitEmulation}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/40 px-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-4"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Exit Emulation
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="admin-eyebrow mb-2">POS Admin Demo</div>
            <h1 className="text-2xl font-bold text-admin-text sm:text-3xl">Welcome, {session.posAdminName}</h1>
            <p className="mt-2 text-sm text-admin-muted">This is a local preview of the support-mode experience.</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-admin-muted">
            <Store className="h-4 w-4" aria-hidden="true" />
            {session.posAdminEmail}
          </div>
        </header>

        <section className="mb-6 rounded-lg border border-admin-warning/30 bg-admin-warning-surface p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-admin-warning" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-admin-text">Frontend demo only</h2>
              <p className="mt-1 text-sm leading-6 text-admin-muted">
                This project has no separate POS Admin application. This preview does not authenticate with a POS Admin account, change its assigned role or permissions, or bypass any role restrictions.
              </p>
              <p className="mt-2 text-sm leading-6 text-admin-muted">
                Production integration point: connect this handoff to the POS Admin application through backend-authorized, scoped, temporary support access with expiry and audit logging.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Demo dashboard" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="admin-card p-5">
            <div className="text-sm font-medium text-admin-muted">Restaurant</div>
            <div className="mt-3 text-lg font-bold text-admin-text">Demo workspace</div>
            <div className="mt-1 text-sm text-admin-muted">No customer data is connected</div>
          </article>
          <article className="admin-card p-5">
            <div className="text-sm font-medium text-admin-muted">Access context</div>
            <div className="mt-3 text-lg font-bold text-admin-text">Support preview</div>
            <div className="mt-1 text-sm text-admin-muted">Role and permissions remain unchanged</div>
          </article>
          <article className="admin-card p-5 sm:col-span-2 lg:col-span-1">
            <div className="text-sm font-medium text-admin-muted">Master Admin</div>
            <div className="mt-3 truncate text-lg font-bold text-admin-text">{session.originalMasterAdmin.name}</div>
            <div className="mt-1 text-sm text-admin-muted">Original session preserved separately</div>
          </article>
        </section>

        <button
          type="button"
          onClick={exitEmulation}
          className="admin-btn-secondary mt-7 gap-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return to Master Admin
        </button>
      </div>
    </main>
  );
}