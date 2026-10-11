"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ActionMenu from "@/components/ui/ActionMenu";
import SearchInput from "@/components/ui/SearchInput";
import {
  loadPOSAdmins,
  savePOSAdmins,
  type POSAdmin,
  type POSAdminStatus,
} from "@/src/lib/pos-admins";

export default function POSAdminsPage() {
  const [admins, setAdmins] = useState<POSAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setAdmins(loadPOSAdmins());
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  function saveAdmins(updatedAdmins: POSAdmin[]) {
    setAdmins(updatedAdmins);

    savePOSAdmins(updatedAdmins);
  }

  function handleStatusToggle(admin: POSAdmin) {
    setUpdatingStatus(admin.id);

    const newStatus: POSAdminStatus =
      admin.status === "Active" ? "Inactive" : "Active";

    const updatedAdmins = admins.map((item) =>
      item.id === admin.id
        ? {
            ...item,
            status: newStatus,
          }
        : item
    );

    setTimeout(() => {
      saveAdmins(updatedAdmins);
      setUpdatingStatus(null);
    }, 400);
  }

  const query = search.trim().toLowerCase();

  const filteredAdmins = admins.filter((admin) => {
    if (!query) return true;

    return (
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      admin.restaurant?.toLowerCase().includes(query)
    );
  });

  const activeCount = admins.filter(
    (admin) => admin.status === "Active"
  ).length;

  const inactiveCount = admins.filter(
    (admin) => admin.status === "Inactive"
  ).length;

  return (
    <div className="min-h-full">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <section className="mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            {/* <div className="admin-eyebrow mb-3">
              05 / POS Admins
            </div> */}

            <h1 className="admin-page-title">
              POS Admin Management
            </h1>

            <p className="admin-page-description max-w-xl">
              Manage POS Admin accounts and their assigned
              restaurants.
            </p>
          </div>

          <Link
            href="/master/pos-admins/add"
            className="admin-btn-primary w-full shrink-0 sm:w-auto"
          >
            <span className="mr-2 text-lg leading-none">
              +
            </span>

            Add POS Admin
          </Link>
        </div>
      </section>

      {/* =========================
          SEARCH + SUMMARY
      ========================= */}

      <section className="admin-card mb-5 p-4 sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* SEARCH */}

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email or restaurant..."
            label="POS Admins"
            className="w-full xl:max-w-[520px]"
          />

          {/* SUMMARY */}

          <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm xl:justify-end">
            <div className="whitespace-nowrap">
              <span className="text-admin-muted">
                Total
              </span>{" "}
              <span className="font-semibold text-admin-primary">
                {admins.length}
              </span>
            </div>

            <div className="whitespace-nowrap">
              <span className="text-admin-muted">
                Active
              </span>{" "}
              <span className="font-semibold text-admin-success">
                {activeCount}
              </span>
            </div>

            <div className="whitespace-nowrap">
              <span className="text-admin-muted">
                Inactive
              </span>{" "}
              <span className="font-semibold text-admin-muted">
                {inactiveCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TABLE
      ========================= */}

      <section className="admin-card overflow-visible">
        <div className="border-b border-admin-border px-5 py-5 sm:px-6">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-admin-text">
            POS Admin Accounts
          </h2>

          <p className="mt-1 text-sm text-admin-muted">
            View and manage POS Admin account access.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table min-w-[760px]">
            <thead>
              <tr>
                <th>POS Admin</th>
                <th>Email</th>
                <th>Restaurant</th>
                <th>Status</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id}>
                    {/* NAME */}

                    <td>
                      <div className="font-semibold text-admin-text">
                        {admin.name}
                      </div>
                    </td>

                    {/* EMAIL */}

                    <td>
                      <span className="text-admin-muted">
                        {admin.email}
                      </span>
                    </td>

                    {/* RESTAURANT */}

                    <td>
                      <span className="font-medium text-admin-text">
                        {admin.restaurant}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td>
                      {admin.status === "Active" ? (
                        <span className="status-active">
                          Active
                        </span>
                      ) : (
                        <span className="status-inactive">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="flex justify-end">
                        <ActionMenu
                          label={`Actions for ${admin.name}`}
                          triggerClassName="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-white text-lg font-semibold tracking-[2px] text-admin-muted transition hover:border-admin-border-strong hover:bg-admin-surface-muted hover:text-admin-primary"
                          triggerContent={<span className="-mt-2">...</span>}
                        >
                            <Link
                              href={`/master/pos-admins/${admin.id}/edit`}
                              role="menuitem"
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-admin-text transition hover:bg-admin-surface-muted"
                            >
                              <span aria-hidden="true" className="w-5 text-admin-muted">
                                ✎
                              </span>

                              Edit
                            </Link>

                            <div className="border-t border-admin-border" />

                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="w-5 text-admin-muted">
                                  ●
                                </span>

                                <span className="text-sm font-medium text-admin-text">
                                  {admin.status}
                                </span>
                              </div>

                              <button
                                type="button"
                                role="menuitem"
                                disabled={
                                  updatingStatus ===
                                  admin.id
                                }
                                onClick={() =>
                                  handleStatusToggle(
                                    admin
                                  )
                                }
                                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                                  admin.status ===
                                  "Active"
                                    ? "bg-admin-primary"
                                    : "bg-admin-border-strong"
                                } ${
                                  updatingStatus ===
                                  admin.id
                                    ? "cursor-wait opacity-60"
                                    : ""
                                }`}
                                aria-label={`Set ${admin.name} ${
                                  admin.status ===
                                  "Active"
                                    ? "inactive"
                                    : "active"
                                }`}
                              >
                                <span
                                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                                    admin.status ===
                                    "Active"
                                      ? "left-6"
                                      : "left-1"
                                  }`}
                                />
                              </button>
                            </div>
                        </ActionMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="py-12 text-center">
                      <div className="text-sm font-semibold text-admin-text">
                        No POS Admins found.
                      </div>

                      <div className="mt-1 text-sm text-admin-muted">
                        Try another name, email or restaurant.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        <div className="border-t border-admin-border bg-admin-surface-muted px-5 py-4 sm:px-6">
          <div className="text-xs text-admin-muted">
            Showing{" "}
            <span className="font-semibold text-admin-text">
              {filteredAdmins.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-admin-text">
              {admins.length}
            </span>{" "}
            POS Admin accounts
          </div>
        </div>
      </section>
    </div>
  );
}