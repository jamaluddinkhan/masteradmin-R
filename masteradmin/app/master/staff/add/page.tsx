"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import FormPageHeading from "@/components/layout/FormPageHeading";

type Staff = {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Inactive";
};

export default function AddStaffPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter staff name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter staff email.");
      return;
    }

    if (!password) {
      setError("Please enter password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const savedStaff = localStorage.getItem("master_staff");

    let staff: Staff[] = [];

    if (savedStaff) {
      try {
        staff = JSON.parse(savedStaff);
      } catch {
        staff = [];
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailExists = staff.some(
      (member) =>
        member.email.toLowerCase() === normalizedEmail
    );

    if (emailExists) {
      setError("This email is already registered.");
      return;
    }

    setSaving(true);

    const newStaff: Staff = {
      id: Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      status: "Active",
    };

    const updatedStaff = [...staff, newStaff];

    localStorage.setItem(
      "master_staff",
      JSON.stringify(updatedStaff)
    );

    setTimeout(() => {
      router.push("/master/staff");
    }, 700);
  }

  return (
    <div className="min-h-full pb-10">
      <FormPageHeading
        eyebrow="Staff / Add"
        title="Add Staff"
        description="Create a new Master Admin staff account."
        backLabel="Back to Staff"
        onBack={() => router.push("/master/staff")}
      />

      {/* FORM CARD */}
      <section className="admin-card mx-auto max-w-4xl overflow-hidden">
        {/* CARD HEADER */}
        <div className="border-b border-admin-border px-6 py-5 sm:px-7">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-admin-text">
            Staff Information
          </h2>

          <p className="mt-1 text-sm text-admin-muted">
            Enter the account details for the new staff member.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* FORM BODY */}
          <div className="space-y-6 px-6 py-7 sm:px-7">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* NAME */}
              <div>
                <label
                  htmlFor="staff-name"
                  className="admin-form-label"
                >
                  Staff Name
                  <span className="ml-1 text-admin-danger">*</span>
                </label>

                <input
                  id="staff-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter staff name"
                  className="admin-input"
                  autoComplete="name"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="staff-email"
                  className="admin-form-label"
                >
                  Email
                  <span className="ml-1 text-admin-danger">*</span>
                </label>

                <input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter staff email"
                  className="admin-input"
                  autoComplete="email"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="staff-password"
                  className="admin-form-label"
                >
                  Password
                  <span className="ml-1 text-admin-danger">*</span>
                </label>

                <input
                  id="staff-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  className="admin-input"
                  autoComplete="new-password"
                />

                <p className="mt-2 text-xs text-admin-muted">
                  Password must contain at least 6 characters.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="staff-confirm-password"
                  className="admin-form-label"
                >
                  Confirm Password
                  <span className="ml-1 text-admin-danger">*</span>
                </label>

                <input
                  id="staff-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm password"
                  className="admin-input"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* DEFAULT STATUS */}
            <div className="rounded-xl border border-admin-border bg-admin-surface-muted px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-admin-text">
                    Account Status
                  </p>

                  <p className="mt-1 text-xs text-admin-muted">
                    New staff accounts are created as active.
                  </p>
                </div>

                <span className="status-active shrink-0">
                  Active
                </span>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="admin-alert-danger px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex flex-col-reverse gap-3 border-t border-admin-border bg-admin-surface-muted px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={() => router.push("/master/staff")}
              disabled={saving}
              className="admin-btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="admin-btn-primary min-w-[135px] w-full sm:w-auto"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </span>
              ) : (
                "Save Staff"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}