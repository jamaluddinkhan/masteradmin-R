"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormPageHeading from "@/components/layout/FormPageHeading";
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
   DEFAULT PERMISSIONS
========================================================= */

function createDefaultPermissions(): Record<
  string,
  Permission
> {
  const permissions: Record<string, Permission> = {};

  MODULES.forEach((module) => {
    permissions[module] = createEmptyPermission();
  });

  return permissions;
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
   ADD ROLE PAGE
========================================================= */

export default function AddRolePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [roleType, setRoleType] = useState<
    "Master Staff" | "POS Admin"
  >("POS Admin");

  const [reportingTo, setReportingTo] =
    useState("Master Admin");

  const [permissions, setPermissions] = useState<
    Record<string, Permission>
  >(createDefaultPermissions());

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

    setSaving(true);

    try {
      const savedRoles =
        localStorage.getItem("master_roles");

      let allRoles: Role[] = [];

      if (savedRoles) {
        try {
          allRoles = JSON.parse(savedRoles);
        } catch {
          allRoles = [];
        }
      }

      /* ================================================
         CHECK DUPLICATE ROLE NAME
      ================================================ */

      const duplicateRole = allRoles.some(
        (role) =>
          role.name.trim().toLowerCase() ===
          name.trim().toLowerCase()
      );

      if (duplicateRole) {
        setSaving(false);
        setError(
          "A role with this name already exists."
        );
        return;
      }

      /* ================================================
         CREATE NEW ROLE ID
      ================================================ */

      const newId =
        allRoles.length > 0
          ? Math.max(
              ...allRoles.map((role) => role.id)
            ) + 1
          : 1;

      /* ================================================
         CREATE ROLE
      ================================================ */

      const newRole: Role = {
        id: newId,

        name: name.trim(),

        description: description.trim(),

        roleType,

        reportingTo,

        permissions,
      };

      const updatedRoles = [
        ...allRoles,
        newRole,
      ];

      /* ================================================
         SAVE TO LOCAL STORAGE
      ================================================ */

      localStorage.setItem(
        "master_roles",
        JSON.stringify(updatedRoles)
      );

      /* ================================================
         REDIRECT
      ================================================ */

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
     PAGE
  ========================================================= */

  return (
    <div className="min-h-full pb-10">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <FormPageHeading
        eyebrow="Roles / Add"
        title="Add Role"
        description="Create a role and configure its access permissions."
        backLabel="Back to Roles"
        onBack={() => router.push("/master/roles")}
      />

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
            Configure the permissions before saving this
            role.
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
                "Save Role"
              )}
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}