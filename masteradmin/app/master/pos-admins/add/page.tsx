"use client";

import { FormEvent, startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FormPageHeading from "@/components/layout/FormPageHeading";
import AdminSelect from "@/components/ui/AdminSelect";

type Status = "Active" | "Inactive";

type POSAdmin = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: Status;
};

type Role = {
  id: number;
  name: string;
  description: string;
  roleType: "Master Staff" | "POS Admin";
  reportingTo: string;
  permissions: Record<
    string,
    {
      view: boolean;
      add: boolean;
      edit: boolean;
    }
  >;
};

const DEFAULT_ROLE = "POS Admin";

export default function AddPOSAdminPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Default role
  const [role, setRole] = useState(DEFAULT_ROLE);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [roles, setRoles] = useState<Role[]>([]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* =========================
     LOAD ROLES
  ========================= */

  useEffect(() => {
    startTransition(() => {
      const savedRoles = localStorage.getItem("master_roles");

      if (savedRoles) {
        try {
          const parsedRoles: Role[] = JSON.parse(savedRoles);
          const posAdminRoles = parsedRoles.filter(
            (item) => item.roleType === "POS Admin"
          );

          setRoles(posAdminRoles);

          const defaultPOSAdmin = posAdminRoles.find(
            (item) => item.name === "POS Admin"
          );

          if (defaultPOSAdmin) setRole(defaultPOSAdmin.name);
        } catch {
          setRoles([]);
          setRole(DEFAULT_ROLE);
        }
      } else {
        setRoles([]);
        setRole(DEFAULT_ROLE);
      }
    });
  }, []);

  /* =========================
     SUBMIT
  ========================= */

  function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email
      .trim()
      .toLowerCase();

    /* =========================
       VALIDATION
    ========================= */

    if (!trimmedName) {
      setError("Please enter POS Admin name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter POS Admin email.");
      return;
    }

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (!password) {
      setError("Please enter password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
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

    /* =========================
       GET EXISTING ADMINS
    ========================= */

    const savedAdmins = localStorage.getItem(
      "master_pos_admins"
    );

    let admins: POSAdmin[] = [];

    if (savedAdmins) {
      try {
        admins = JSON.parse(savedAdmins);
      } catch {
        admins = [];
      }
    }

    /* =========================
       EMAIL DUPLICATE CHECK
    ========================= */

    const emailExists = admins.some(
      (admin) =>
        admin.email.toLowerCase() ===
        trimmedEmail
    );

    if (emailExists) {
      setError(
        "This email is already registered."
      );
      return;
    }

    /* =========================
       CREATE POS ADMIN
    ========================= */

    setSaving(true);

    const newAdmin: POSAdmin = {
      id: Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      role: role,
      status: "Active",
    };

    const updatedAdmins = [
      ...admins,
      newAdmin,
    ];

    localStorage.setItem(
      "master_pos_admins",
      JSON.stringify(updatedAdmins)
    );

    /* =========================
       REDIRECT
    ========================= */

    setTimeout(() => {
      router.push("/master/pos-admins");
    }, 600);
  }

  /* =========================
     CANCEL
  ========================= */

  function handleCancel() {
    if (saving) return;

    router.push("/master/pos-admins");
  }

  return (
    <div className="min-h-full pb-10">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <FormPageHeading
        eyebrow="POS Admins / Add"
        title="Add POS Admin"
        description="Create a POS Admin account and assign a role."
        backLabel="Back to POS Admins"
        onBack={handleCancel}
      />

      {/* =========================
          FORM CARD
      ========================= */}

      <section className="admin-card mx-auto max-w-4xl overflow-hidden">
        {/* CARD HEADER */}

        <div className="border-b border-admin-border px-5 py-5 sm:px-7">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-admin-text">
            POS Admin Information
          </h2>

          <p className="mt-1 text-sm text-admin-muted">
            Enter the account details and assign a
            role to this POS Admin.
          </p>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-6 sm:px-7">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* =========================
                  NAME
              ========================= */}

              <div>
                <label
                  htmlFor="name"
                  className="admin-form-label"
                >
                  POS Admin Name
                  <span className="ml-1 text-admin-danger">
                    *
                  </span>
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter POS Admin name"
                  className="admin-input"
                  autoComplete="name"
                />
              </div>

              {/* =========================
                  EMAIL
              ========================= */}

              <div>
                <label
                  htmlFor="email"
                  className="admin-form-label"
                >
                  Email
                  <span className="ml-1 text-admin-danger">
                    *
                  </span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter POS Admin email"
                  className="admin-input"
                  autoComplete="email"
                />
              </div>

              {/* =========================
                  ROLE
              ========================= */}

              <div>
                <label
                  htmlFor="role"
                  className="admin-form-label"
                >
                  Role
                  <span className="ml-1 text-admin-danger">
                    *
                  </span>
                </label>

                <AdminSelect
                  id="role"
                  ariaLabel="Role"
                  value={role}
                  onChange={(value) => {
                    setRole(value);
                    setError("");
                  }}
                  options={[
                    { value: "POS Admin", label: "POS Admin" },
                    ...roles
                      .filter((item) => item.name !== "POS Admin")
                      .map((item) => ({ value: item.name, label: item.name })),
                  ]}
                />
              </div>

              {/* =========================
                  PASSWORD
              ========================= */}

              <div>
                <label
                  htmlFor="password"
                  className="admin-form-label"
                >
                  Password
                  <span className="ml-1 text-admin-danger">
                    *
                  </span>
                </label>

                <input
                  id="password"
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
                  Minimum 6 characters.
                </p>
              </div>

              {/* =========================
                  CONFIRM PASSWORD
              ========================= */}

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="admin-form-label"
                >
                  Confirm Password
                  <span className="ml-1 text-admin-danger">
                    *
                  </span>
                </label>

                <input
                  id="confirmPassword"
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
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* =========================
                ERROR
            ========================= */}

            {error && (
              <div className="admin-alert-danger mt-5 px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          {/* =========================
              FOOTER ACTIONS
          ========================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-admin-border px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="admin-btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="admin-btn-primary w-full min-w-[145px] sm:w-auto"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Saving...
                </span>
              ) : (
                "Create POS Admin"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}