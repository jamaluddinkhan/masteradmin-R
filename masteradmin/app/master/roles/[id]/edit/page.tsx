"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AdminSelect from "@/components/ui/AdminSelect";

type Permission = {
  view: boolean;
  add: boolean;
  edit: boolean;
};

type Role = {
  id: number;
  name: string;
  description: string;
  roleType: "Master Staff" | "POS Admin";
  reportingTo: string;
  permissions: Record<string, Permission>;
};

const DEFAULT_ROLES: Role[] = [
  {
    id: 1,
    name: "POS Admin",
    description:
      "Manages restaurant configuration, menu, orders, staff, tables, QR and website settings.",
    roleType: "POS Admin",
    reportingTo: "Master Admin",
    permissions: {
      Dashboard: {
        view: true,
        add: false,
        edit: false,
      },
      Restaurant: {
        view: true,
        add: true,
        edit: true,
      },
      Menu: {
        view: true,
        add: true,
        edit: true,
      },
      Orders: {
        view: true,
        add: false,
        edit: true,
      },
      Staff: {
        view: true,
        add: true,
        edit: true,
      },
      "Tables & QR": {
        view: true,
        add: true,
        edit: true,
      },
      "Website Settings": {
        view: true,
        add: false,
        edit: true,
      },
      "POS Admin Management": {
        view: true,
        add: false,
        edit: false,
      },
    },
  },
];

const MODULES = [
  "Dashboard",
  "Restaurant",
  "Menu",
  "Orders",
  "Staff",
  "Tables & QR",
  "Website Settings",
  "POS Admin Management",
];

function createEmptyPermission(): Permission {
  return {
    view: false,
    add: false,
    edit: false,
  };
}

/* =========================================================
   CUSTOM CHECKBOX
========================================================= */

function PermissionCheckbox({
  checked,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onChange}
      className={`
        flex h-6 w-6 shrink-0 items-center justify-center
        rounded-full border transition-all duration-150
        ${
          checked
            ? "border-admin-primary bg-admin-primary text-white"
            : "border-admin-border-strong bg-white text-transparent"
        }
        ${
          disabled
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer hover:border-admin-primary"
        }
      `}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
      >
        <path
          d="M4 10.5L8 14.5L16 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* =========================================================
   EDIT ROLE PAGE
========================================================= */

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();

  const roleId = Number(params.id);

  const [role, setRole] = useState<Role | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [roleType, setRoleType] = useState<
    "Master Staff" | "POS Admin"
  >("POS Admin");

  const [reportingTo, setReportingTo] =
    useState("Master Admin");

  const [permissions, setPermissions] = useState<
    Record<string, Permission>
  >({});

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* =========================================================
     LOAD ROLE
  ========================================================= */

  useEffect(() => {
    const savedRoles =
      localStorage.getItem("master_roles");

    let allRoles: Role[] = DEFAULT_ROLES;

    if (savedRoles) {
      try {
        allRoles = JSON.parse(savedRoles);
      } catch {
        allRoles = DEFAULT_ROLES;
      }
    }

    const foundRole = allRoles.find(
      (item) => item.id === roleId
    );

    if (!foundRole) {
      startTransition(() => setError("Role not found."));
      return;
    }

    const normalizedPermissions: Record<
      string,
      Permission
    > = {};

    MODULES.forEach((module) => {
      normalizedPermissions[module] =
        foundRole.permissions?.[module] ??
        createEmptyPermission();
    });

    startTransition(() => {
      setRole(foundRole);
      setName(foundRole.name);
      setDescription(foundRole.description);
      setRoleType(foundRole.roleType);
      setReportingTo(foundRole.reportingTo);
      setPermissions(normalizedPermissions);
    });
  }, [roleId]);

  /* =========================================================
     UPDATE PERMISSION
  ========================================================= */

  function updatePermission(
    module: string,
    type: keyof Permission
  ) {
    setPermissions((current) => ({
      ...current,
      [module]: {
        ...current[module],
        [type]: !current[module]?.[type],
      },
    }));
  }

  /* =========================================================
     MODULE CHECKBOX
  ========================================================= */

  function updateModuleSelection(module: string) {
    const current = permissions[module];

    const shouldEnable =
      !current?.view &&
      !current?.add &&
      !current?.edit;

    setPermissions((currentPermissions) => ({
      ...currentPermissions,
      [module]: {
        view: shouldEnable,
        add: shouldEnable
          ? currentPermissions[module]?.add ?? false
          : false,
        edit: shouldEnable
          ? currentPermissions[module]?.edit ?? false
          : false,
      },
    }));
  }

  /* =========================================================
     SAVE ROLE
  ========================================================= */

  function handleSave() {
    setError("");

    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }

    if (!description.trim()) {
      setError("Role description is required.");
      return;
    }

    if (!role) {
      setError("Role not found.");
      return;
    }

    setSaving(true);

    try {
      const savedRoles =
        localStorage.getItem("master_roles");

      let allRoles: Role[] = DEFAULT_ROLES;

      if (savedRoles) {
        try {
          allRoles = JSON.parse(savedRoles);
        } catch {
          allRoles = DEFAULT_ROLES;
        }
      }

      const updatedRoles = allRoles.map((item) => {
        if (item.id !== role.id) {
          return item;
        }

        return {
          ...item,
          name: name.trim(),
          description: description.trim(),
          roleType,
          reportingTo,
          permissions,
        };
      });

      localStorage.setItem(
        "master_roles",
        JSON.stringify(updatedRoles)
      );

      setTimeout(() => {
        router.push("/master/roles");
      }, 500);
    } catch {
      setSaving(false);

      setError(
        "Something went wrong while saving the role."
      );
    }
  }

  /* =========================================================
     PERMISSION COUNT
  ========================================================= */

  const permissionCount = useMemo(() => {
    return MODULES.filter((module) => {
      const permission = permissions[module];

      return (
        permission?.view ||
        permission?.add ||
        permission?.edit
      );
    }).length;
  }, [permissions]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (!role && !error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-admin-muted">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-admin-border border-t-admin-primary" />
          Loading role...
        </div>
      </div>
    );
  }

  /* =========================================================
     ROLE NOT FOUND
  ========================================================= */

  if (error && !role) {
    return (
      <div className="admin-card p-8">
        <div className="admin-alert-danger px-4 py-3 text-sm font-medium">
          {error}
        </div>

        <Link
          href="/master/roles"
          className="admin-btn-secondary mt-5"
        >
          Back to Roles
        </Link>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-full pb-10">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="mb-7">
        <div className="flex items-center gap-4">

          <Link
            href="/master/roles"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-admin-border bg-white text-xl text-admin-text transition hover:bg-admin-surface-muted"
            aria-label="Back to roles"
          >
            ←
          </Link>

          <div>
            <div className="admin-eyebrow mb-2">
              Roles / Edit
            </div>

            <h1 className="admin-page-title">
              Edit Role
            </h1>

            <p className="admin-page-description">
              Update role information and access permissions.
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <section className="admin-card mb-6 p-7">

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* ROLE NAME */}

          <div>
            <label className="admin-form-label">
              Role Name{" "}
              <span className="text-admin-danger">*</span>
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Enter role name"
              className="admin-input"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="admin-form-label">
              Role Description{" "}
              <span className="text-admin-danger">*</span>
            </label>

            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              placeholder="Enter role description"
              rows={3}
              className="admin-input min-h-[96px] py-3"
            />
          </div>

          {/* ROLE TYPE */}

          <div>
            <label className="admin-form-label">
              Role Type{" "}
              <span className="text-admin-danger">*</span>
            </label>

            <AdminSelect
              ariaLabel="Role Type"
              value={roleType}
              onChange={(value) => setRoleType(value as "Master Staff" | "POS Admin")}
              options={[
                { value: "POS Admin", label: "POS Admin" },
                { value: "Master Staff", label: "Master Staff" },
              ]}
            />
          </div>

          {/* REPORTING TO */}

          <div className="lg:col-span-3">

            <label className="admin-form-label">
              Role Reporting To
            </label>

            <AdminSelect
              ariaLabel="Role Reporting To"
              value={reportingTo}
              onChange={setReportingTo}
              options={[{ value: "Master Admin", label: "Master Admin" }]}
              className="max-w-xl"
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          MENU FEATURES
      ===================================================== */}

      <section className="admin-card overflow-hidden">

        {/* HEADER */}

        <div className="border-b border-admin-border px-7 py-6">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h2 className="text-xl font-bold tracking-[-0.025em] text-admin-text">
                Menu Features
              </h2>

              <p className="mt-1 text-sm text-admin-muted">
                Select the modules and actions available
                for this role.
              </p>
            </div>

            <div className="text-xs font-medium text-admin-muted">
              {permissionCount} modules enabled
            </div>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">

          <table className="admin-table min-w-[850px]">

            <thead>
              <tr>

                <th className="w-[55%]">
                  Name
                </th>

                <th className="text-center">
                  View
                </th>

                <th className="text-center">
                  Add
                </th>

                <th className="text-center">
                  Edit
                </th>

              </tr>
            </thead>

            <tbody>

              {MODULES.map((module) => {

                const permission =
                  permissions[module] ??
                  createEmptyPermission();

                const moduleEnabled =
                  permission.view ||
                  permission.add ||
                  permission.edit;

                const addDisabled =
                  module === "Dashboard" ||
                  module === "Orders";

                return (

                  <tr key={module}>

                    {/* =================================================
                        MODULE NAME
                    ================================================= */}

                    <td>

                      <div className="flex items-center gap-4">

                        <span className="text-lg text-admin-muted">
                          ›
                        </span>

                        <div className="flex items-center gap-3">

                          <PermissionCheckbox
                            checked={moduleEnabled}
                            onChange={() =>
                              updateModuleSelection(
                                module
                              )
                            }
                          />

                          <span className="font-semibold text-admin-text">
                            {module}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* =================================================
                        VIEW
                    ================================================= */}

                    <td>

                      <div className="flex items-center justify-center gap-2">

                        <PermissionCheckbox
                          checked={permission.view}
                          onChange={() =>
                            updatePermission(
                              module,
                              "view"
                            )
                          }
                        />

                        <span
                          className={
                            permission.view
                              ? "text-admin-muted"
                              : "text-admin-subtle"
                          }
                        >
                          View
                        </span>

                      </div>

                    </td>

                    {/* =================================================
                        ADD
                    ================================================= */}

                    <td>

                      <div
                        className={`flex items-center justify-center gap-2 ${
                          addDisabled
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >

                        <PermissionCheckbox
                          checked={permission.add}
                          disabled={addDisabled}
                          onChange={() =>
                            updatePermission(
                              module,
                              "add"
                            )
                          }
                        />

                        <span
                          className={
                            permission.add
                              ? "text-admin-muted"
                              : "text-admin-subtle"
                          }
                        >
                          Add
                        </span>

                      </div>

                    </td>

                    {/* =================================================
                        EDIT
                    ================================================= */}

                    <td>

                      <div className="flex items-center justify-center gap-2">

                        <PermissionCheckbox
                          checked={permission.edit}
                          onChange={() =>
                            updatePermission(
                              module,
                              "edit"
                            )
                          }
                        />

                        <span
                          className={
                            permission.edit
                              ? "text-admin-muted"
                              : "text-admin-subtle"
                          }
                        >
                          Edit
                        </span>

                      </div>

                    </td>

                  </tr>

                );
              })}

            </tbody>

          </table>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (

          <div className="admin-alert-danger mx-7 mt-5 px-4 py-3 text-sm font-medium">
            {error}
          </div>

        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="flex flex-col gap-3 border-t border-admin-border bg-admin-surface-muted px-7 py-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="text-xs text-admin-muted">
            Changes will be saved to this role.
          </div>

          <div className="flex justify-end gap-3">

            <Link
              href="/master/roles"
              className="admin-btn-secondary"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="admin-btn-primary min-w-[135px]"
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

      </section>

    </div>
  );
}