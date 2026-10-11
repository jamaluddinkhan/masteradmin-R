"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  LoaderCircle,
  ShieldCheck,
  UserRoundCog,
  X,
} from "lucide-react";
import SearchInput from "@/components/ui/SearchInput";
import { loadPOSAdmins, type POSAdmin } from "@/src/lib/pos-admins";
import { startEmulation } from "@/src/lib/emulation-session";
import { useModalBehavior } from "@/src/lib/use-modal-behavior";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [emulationOpen, setEmulationOpen] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [starting, setStarting] = useState(false);
  const [admins, setAdmins] = useState<POSAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<POSAdmin | null>(null);
  const [confirming, setConfirming] = useState(false);
  const emulationDialogRef = useRef<HTMLElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  function handleLogout() {
    setLoggingOut(true);

    setTimeout(() => {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      localStorage.removeItem("master_admin_emulation_session");

      setOpen(false);

      router.replace("/login");
    }, 500);
  }

  function openEmulation() {
    setOpen(false);
    setEmulationOpen(true);
    setLoadingAdmins(true);
    setSearch("");
    setSelectedAdmin(null);
    setConfirming(false);

    window.setTimeout(() => {
      setAdmins(loadPOSAdmins());
      setLoadingAdmins(false);
    }, 180);
  }

  function closeEmulation() {
    if (starting) return;
    setEmulationOpen(false);
  }

  useModalBehavior(emulationOpen, emulationDialogRef, closeEmulation);

  useEffect(() => {
    if (!open) return;

    function dismiss(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [open]);

  useEffect(() => {
    startTransition(() => setOpen(false));
  }, [pathname]);

  function beginEmulation() {
    if (!selectedAdmin || selectedAdmin.status !== "Active") return;

    let originalMasterAdmin = {
      name: "Jamaluddin Khan",
      email: "master@admin.com",
      role: "Master Admin",
    };

    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as Partial<typeof originalMasterAdmin>;
        originalMasterAdmin = {
          name: parsedUser.name || originalMasterAdmin.name,
          email: parsedUser.email || originalMasterAdmin.email,
          role: parsedUser.role || originalMasterAdmin.role,
        };
      }
    } catch {
      // Keep the identity shown in the existing Master Admin header.
    }

    startEmulation({
      admin: selectedAdmin,
      originalMasterAdmin,
      returnDestination: pathname.startsWith("/") ? pathname : "/master",
    });
    setStarting(true);
    router.push("/pos-admin/emulation");
  }

  const filteredAdmins = admins.filter((admin) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query)
    );
  });

  return (
    <header className="relative flex h-19 items-center justify-between border-b border-admin-border bg-white px-4 sm:px-8">

      {/* LEFT */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-admin-muted">
          Administration
        </div>

        <div className="mt-1 text-[18px] font-bold text-admin-primary">
          Master Admin
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={openEmulation}
          aria-label="Emulation"
          title="Emulation"
          className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-lg border border-admin-primary/20 bg-admin-primary/5 text-sm font-semibold text-admin-primary transition hover:border-admin-primary/40 hover:bg-admin-primary/10 sm:w-auto sm:px-4"
        >
          <UserRoundCog className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Emulation</span>
        </button>

      <div ref={profileMenuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-admin-surface-muted"
        >
          {/* AVATAR */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-admin-primary text-sm font-bold text-white">
            JK
          </div>

          {/* USER */}
          <div className="hidden text-left sm:block">
            <div className="text-[13px] font-semibold text-admin-text">
              Jamaluddin Khan
            </div>

            <div className="text-[11px] text-admin-muted">
              Master Admin
            </div>
          </div>

          <span className="text-[9px] text-admin-muted">
            ▼
          </span>
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="admin-dropdown-menu absolute right-0 top-14.5 z-50 w-48">

            <div className="border-b border-admin-border px-4 py-3">
              <div className="text-sm font-semibold text-admin-text">
                Jamaluddin Khan
              </div>

              <div className="mt-1 text-xs text-admin-muted">
                Master Admin
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-admin-danger hover:bg-admin-danger-surface disabled:opacity-60"
              >
                {loggingOut ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-admin-danger-surface border-t-admin-danger" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <span>↪</span>
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {emulationOpen && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEmulation();
          }}
        >
          <section
            ref={emulationDialogRef}
            aria-labelledby="emulation-title"
            aria-modal="true"
            className="admin-modal max-h-[min(760px,calc(100dvh-32px))] max-w-xl overflow-y-auto"
            role="dialog"
            tabIndex={-1}
          >
            <div className="flex items-start justify-between gap-4 border-b border-admin-border px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-admin-primary/10 text-admin-primary">
                  <UserRoundCog className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="emulation-title" className="text-lg font-bold text-admin-text">
                    {confirming ? "Confirm emulation" : "Emulate a POS Admin"}
                  </h2>
                  <p className="mt-1 text-sm text-admin-muted">
                    {confirming
                      ? "Review the account before opening the demo workspace."
                      : "Choose an account to open its frontend demo workspace."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEmulation}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
                aria-label="Close emulation dialog"
                disabled={starting}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {confirming && selectedAdmin ? (
              <div className="space-y-5 px-5 py-5 sm:px-6">
                <div className="rounded-lg border border-admin-border bg-admin-surface-muted p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-admin-muted">Selected POS Admin</div>
                  <div className="mt-3 font-semibold text-admin-text">{selectedAdmin.name}</div>
                  <div className="mt-1 break-all text-sm text-admin-muted">{selectedAdmin.email}</div>
                  <span className="status-active mt-3">{selectedAdmin.status}</span>
                </div>
                <div className="flex gap-3 rounded-lg border border-admin-warning/30 bg-admin-warning-surface p-4 text-sm text-admin-warning">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p>
                    Continue into the demo as this account? Your Master Admin session will remain separate and unchanged.
                  </p>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="admin-btn-secondary gap-2"
                    disabled={starting}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to accounts
                  </button>
                  <button
                    type="button"
                    onClick={beginEmulation}
                    disabled={starting}
                    className="admin-btn-primary gap-2 disabled:cursor-wait"
                  >
                    {starting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Opening demo...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Confirm and enter demo
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-5 pt-5 sm:px-6">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or email..."
                    label="POS Admin accounts"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto px-5 py-3 sm:px-6" aria-live="polite">
                  {loadingAdmins ? (
                    <div className="admin-empty-state">
                      <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-admin-primary" aria-hidden="true" />
                      <p className="mt-3 text-sm">Loading POS Admin accounts...</p>
                    </div>
                  ) : filteredAdmins.length === 0 ? (
                    <div className="admin-empty-state">
                      <UserRoundCog className="mx-auto h-7 w-7 text-admin-subtle" aria-hidden="true" />
                      <p className="mt-3 text-sm font-semibold text-admin-text">
                        {admins.length === 0 ? "No POS Admin accounts available" : "No matching accounts"}
                      </p>
                      <p className="mt-1 text-sm">
                        {admins.length === 0 ? "Create a POS Admin account to use the demo." : "Try another name or email."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAdmins.map((admin) => {
                        const isSelected = selectedAdmin?.id === admin.id;
                        return (
                          <button
                            key={admin.id}
                            type="button"
                            onClick={() => setSelectedAdmin(admin)}
                            aria-pressed={isSelected}
                            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                              isSelected
                                ? "border-admin-primary bg-admin-primary/5 ring-1 ring-admin-primary/20"
                                : "border-admin-border hover:border-admin-border-strong hover:bg-admin-surface-muted"
                            }`}
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-surface-muted text-sm font-bold text-admin-primary">
                              {admin.name.slice(0, 1).toUpperCase()}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-admin-text">{admin.name}</span>
                              <span className="mt-0.5 block break-all text-xs leading-4 text-admin-muted">{admin.email}</span>
                            </span>
                            <span className={`shrink-0 ${admin.status === "Active" ? "status-active" : "status-inactive"}`}>{admin.status}</span>
                            {isSelected && <Check className="h-4 w-4 shrink-0 text-admin-primary" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-admin-border px-5 py-4 sm:px-6">
                  <div className="mb-4 flex items-start gap-2 text-xs leading-5 text-admin-muted">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-admin-primary" aria-hidden="true" />
                    <p>Frontend demo only. No authorization or role-permission bypass is performed.</p>
                  </div>
                  {selectedAdmin?.status === "Inactive" && (
                    <p className="mb-3 text-sm text-admin-warning">Inactive accounts cannot be opened in the demo.</p>
                  )}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" onClick={closeEmulation} className="admin-btn-secondary">Cancel</button>
                    <button
                      type="button"
                      onClick={() => setConfirming(true)}
                      disabled={!selectedAdmin || selectedAdmin.status !== "Active" || loadingAdmins}
                      className="admin-btn-primary gap-2"
                    >
                      <UserRoundCog className="h-4 w-4" aria-hidden="true" />
                      Start Emulation
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </header>
  );
}