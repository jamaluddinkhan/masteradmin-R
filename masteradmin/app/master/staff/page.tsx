"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ActionMenu from "@/components/ui/ActionMenu";
import SearchInput from "@/components/ui/SearchInput";
import { useModalBehavior } from "@/src/lib/use-modal-behavior";

type Staff = {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  password?: string;
};

const DEFAULT_STAFF: Staff[] = [
  {
    id: 1,
    name: "Jamal",
    email: "jamal@admin.com",
    status: "Active",
  },
  {
    id: 2,
    name: "Prashant",
    email: "prashant@admin.com",
    status: "Active",
  },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");

  const [editStaff, setEditStaff] = useState<Staff | null>(null);

  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const editDialogRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     LOAD STAFF
  ========================= */

  useEffect(() => {
    const savedStaff = localStorage.getItem("master_staff");
    let staffToLoad: Staff[];

    if (savedStaff) {
      try {
        staffToLoad = JSON.parse(savedStaff);
      } catch {
        staffToLoad = DEFAULT_STAFF;
        localStorage.setItem("master_staff", JSON.stringify(DEFAULT_STAFF));
      }
    } else {
      staffToLoad = DEFAULT_STAFF;
      localStorage.setItem("master_staff", JSON.stringify(DEFAULT_STAFF));
    }

    startTransition(() => setStaff(staffToLoad));
  }, []);

  /* =========================
     SAVE STAFF
  ========================= */

  function saveStaff(updatedStaff: Staff[]) {
    setStaff(updatedStaff);

    localStorage.setItem(
      "master_staff",
      JSON.stringify(updatedStaff)
    );
  }

  /* =========================
     EDIT
  ========================= */

  function openEdit(member: Staff) {
    setEditStaff({ ...member });
    setChangePassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }

  function closeEdit() {
    if (saving) return;

    setEditStaff(null);
    setChangePassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }

  useModalBehavior(Boolean(editStaff), editDialogRef, closeEdit);

  function handleEditSave() {
    if (!editStaff) return;

    setError("");

    if (!editStaff.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!editStaff.email.trim()) {
      setError("Email is required.");
      return;
    }

    const emailExists = staff.some(
      (member) =>
        member.id !== editStaff.id &&
        member.email.toLowerCase() ===
          editStaff.email.trim().toLowerCase()
    );

    if (emailExists) {
      setError("This email is already used by another staff.");
      return;
    }

    if (changePassword) {
      if (!newPassword) {
        setError("Please enter new password.");
        return;
      }

      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }

      if (!confirmPassword) {
        setError("Please confirm new password.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
    }

    setSaving(true);

    const updatedStaff = staff.map((member) => {
      if (member.id !== editStaff.id) {
        return member;
      }

      const updatedMember: Staff = {
        ...member,
        name: editStaff.name.trim(),
        email: editStaff.email.trim().toLowerCase(),
        status: editStaff.status,
      };

      if (changePassword) {
        updatedMember.password = newPassword;
      }

      return updatedMember;
    });

    setTimeout(() => {
      saveStaff(updatedStaff);

      setSaving(false);
      setEditStaff(null);
      setChangePassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }, 700);
  }

  /* =========================
     ACTIVE / INACTIVE
  ========================= */

  function handleStatusToggle(member: Staff) {
    setUpdatingStatus(member.id);

    const newStatus: "Active" | "Inactive" =
      member.status === "Active" ? "Inactive" : "Active";

    const updatedStaff = staff.map((item) =>
      item.id === member.id
        ? {
            ...item,
            status: newStatus,
          }
        : item
    );

    setTimeout(() => {
      saveStaff(updatedStaff);
      setUpdatingStatus(null);
    }, 500);
  }

  /* =========================
     SEARCH
  ========================= */

  const query = search.trim().toLowerCase();

  const filteredStaff = staff.filter((member) => {
    if (!query) return true;

    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  });

  const activeCount = staff.filter(
    (member) => member.status === "Active"
  ).length;

  const inactiveCount = staff.filter(
    (member) => member.status === "Inactive"
  ).length;

  return (
    <div className="min-h-full">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <section className="mb-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="admin-page-title">
              Staff Management
            </h1>

            <p className="admin-page-description max-w-xl">
              Manage Master Admin staff accounts and access.
            </p>
          </div>

          <Link
            href="/master/staff/add"
            className="admin-btn-primary shrink-0"
          >
            <span className="mr-2 text-lg leading-none">
              +
            </span>

            Add Staff
          </Link>
        </div>
      </section>

      {/* =========================
          SEARCH + SUMMARY
      ========================= */}

      <section className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* SEARCH */}

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
          label="staff"
          className="w-full max-w-sm"
        />

        {/* SUMMARY */}

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-admin-muted">
              Total
            </span>{" "}
            <span className="font-semibold text-admin-primary">
              {staff.length}
            </span>
          </div>

          <div>
            <span className="text-admin-muted">
              Active
            </span>{" "}
            <span className="font-semibold text-admin-success">
              {activeCount}
            </span>
          </div>

          <div>
            <span className="text-admin-muted">
              Inactive
            </span>{" "}
            <span className="font-semibold text-admin-muted">
              {inactiveCount}
            </span>
          </div>
        </div>
      </section>

      {/* =========================
          STAFF TABLE
      ========================= */}

      <section className="admin-card overflow-visible">
        <div className="border-b border-admin-border px-6 py-5">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-admin-text">
            Staff Accounts
          </h2>

          <p className="mt-1 text-sm text-admin-muted">
            Manage staff account access and status.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((member) => (
                  <tr key={member.id}>
                    {/* NAME */}

                    <td>
                      <div className="font-semibold text-admin-text">
                        {member.name}
                      </div>
                    </td>

                    {/* EMAIL */}

                    <td>
                      <span className="text-admin-muted">
                        {member.email}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td>
                      {member.status === "Active" ? (
                        <span className="status-active">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-admin-success" />
                          Active
                        </span>
                      ) : (
                        <span className="status-inactive">
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-admin-muted" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="flex justify-end">
                        <ActionMenu
                          label={`Actions for ${member.name}`}
                          triggerClassName="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-white text-admin-muted transition hover:border-admin-border-strong hover:bg-admin-surface-muted hover:text-admin-primary"
                          triggerContent={<span className="mb-1 text-base font-bold tracking-[2px]">•••</span>}
                        >
                            {/* EDIT */}

                            <button
                              type="button"
                              role="menuitem"
                              onClick={() =>
                                openEdit(member)
                              }
                              className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-admin-text transition hover:bg-admin-surface-muted"
                            >
                              Edit
                            </button>

                            <div className="border-t border-admin-border" />

                            {/* STATUS */}

                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    member.status ===
                                    "Active"
                                      ? "bg-admin-success"
                                      : "bg-admin-muted"
                                  }`}
                                />

                                <span className="text-sm font-medium text-admin-text">
                                  {member.status}
                                </span>
                              </div>

                              {/* TOGGLE */}

                              <button
                                type="button"
                                role="menuitem"
                                disabled={
                                  updatingStatus ===
                                  member.id
                                }
                                onClick={() =>
                                  handleStatusToggle(
                                    member
                                  )
                                }
                                className={`relative h-6 w-11 rounded-full transition ${
                                  member.status ===
                                  "Active"
                                    ? "bg-admin-primary"
                                    : "bg-admin-border-strong"
                                } ${
                                  updatingStatus ===
                                  member.id
                                    ? "cursor-wait opacity-60"
                                    : ""
                                }`}
                                aria-label={`Set ${member.name} ${
                                  member.status ===
                                  "Active"
                                    ? "inactive"
                                    : "active"
                                }`}
                              >
                                <span
                                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                                    member.status ===
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
                  <td colSpan={4}>
                    <div className="py-12 text-center">
                      <div className="text-sm font-semibold text-admin-text">
                        No staff found.
                      </div>

                      <div className="mt-1 text-sm text-admin-muted">
                        Try searching with a different
                        name or email.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        <div className="border-t border-admin-border bg-admin-surface-muted px-6 py-4">
          <div className="text-xs text-admin-muted">
            Showing{" "}
            <span className="font-semibold text-admin-text">
              {filteredStaff.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-admin-text">
              {staff.length}
            </span>{" "}
            staff accounts
          </div>
        </div>
      </section>

      {/* =========================
          EDIT MODAL
      ========================= */}

      {editStaff && (
       <div
         className="admin-modal-backdrop z-50 px-4 py-6"
         onMouseDown={(event) => {
           if (event.target === event.currentTarget) closeEdit();
         }}
       >
         <div
           ref={editDialogRef}
           className="admin-modal max-h-[min(90dvh,760px)] max-w-lg overflow-y-auto"
           role="dialog"
           aria-modal="true"
           aria-labelledby="edit-staff-title"
           tabIndex={-1}
         >
            {/* HEADER */}

            <div className="border-b border-admin-border px-6 py-5">
              <div className="admin-eyebrow mb-2">
                Staff Account
              </div>

              <h2 id="edit-staff-title" className="text-xl font-bold tracking-[-0.025em] text-admin-text">
                Edit Staff
              </h2>

              <p className="mt-1 text-sm text-admin-muted">
                Update staff account information.
              </p>
            </div>

            {/* BODY */}

            <div className="space-y-5 px-6 py-6">
              {/* NAME */}

              <div>
                <label className="admin-form-label">
                  Name
                </label>

                <input
                  type="text"
                  value={editStaff.name}
                  onChange={(e) =>
                    setEditStaff({
                      ...editStaff,
                      name: e.target.value,
                    })
                  }
                  className="admin-input"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="admin-form-label">
                  Email
                </label>

                <input
                  type="email"
                  value={editStaff.email}
                  onChange={(e) =>
                    setEditStaff({
                      ...editStaff,
                      email: e.target.value,
                    })
                  }
                  className="admin-input"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="admin-form-label">
                  Account Status
                </label>

                <div className="flex items-center justify-between rounded-xl border border-admin-border bg-admin-surface-muted px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-admin-text">
                      {editStaff.status}
                    </div>

                    <div className="mt-1 text-xs text-admin-muted">
                      Account access status
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditStaff({
                        ...editStaff,
                        status:
                          editStaff.status ===
                          "Active"
                            ? "Inactive"
                            : "Active",
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition ${
                      editStaff.status === "Active"
                        ? "bg-admin-primary"
                        : "bg-admin-border-strong"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                        editStaff.status === "Active"
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* PASSWORD */}

              <div className="rounded-xl border border-admin-border bg-admin-surface-muted p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={changePassword}
                    onChange={(e) => {
                      setChangePassword(
                        e.target.checked
                      );
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                    }}
                    className="admin-checkbox"
                  />

                  <div>
                    <p className="text-sm font-semibold text-admin-text">
                      Change Password
                    </p>

                    <p className="mt-0.5 text-xs text-admin-muted">
                      Set a new password for this staff
                      account.
                    </p>
                  </div>
                </label>

                {changePassword && (
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="admin-form-label">
                        New Password
                      </label>

                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(
                            e.target.value
                          );
                          setError("");
                        }}
                        placeholder="Enter new password"
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <label className="admin-form-label">
                        Confirm Password
                      </label>

                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(
                            e.target.value
                          );
                          setError("");
                        }}
                        placeholder="Confirm password"
                        className="admin-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ERROR */}

              {error && (
                <div className="admin-alert-danger px-4 py-3 text-sm font-medium">
                  {error}
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-admin-border px-6 py-5">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="admin-btn-secondary"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleEditSave}
                disabled={saving}
                className="admin-btn-primary min-w-[130px]"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}