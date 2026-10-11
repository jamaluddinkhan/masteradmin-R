"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ActionMenu from "@/components/ui/ActionMenu";
import AdminSelect from "@/components/ui/AdminSelect";
import SearchInput from "@/components/ui/SearchInput";

type Permission = {
  view: boolean;
  add: boolean;
  edit: boolean;
};

export type Role = {
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

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);

  const [search, setSearch] = useState("");
  const [roleType, setRoleType] = useState("");
  const [reportingTo, setReportingTo] = useState("");


  /* =========================================================
     LOAD ROLES
  ========================================================= */

  useEffect(() => {
    let rolesToLoad = DEFAULT_ROLES;
    const savedRoles = localStorage.getItem("master_roles");

    if (savedRoles) {
      try {
        const parsedRoles: unknown = JSON.parse(savedRoles);
        if (Array.isArray(parsedRoles)) {
          rolesToLoad = parsedRoles as Role[];
        } else {
          localStorage.setItem("master_roles", JSON.stringify(DEFAULT_ROLES));
        }
      } catch {
        localStorage.setItem("master_roles", JSON.stringify(DEFAULT_ROLES));
      }
    } else {
      localStorage.setItem("master_roles", JSON.stringify(DEFAULT_ROLES));
    }

    startTransition(() => setRoles(rolesToLoad));
  }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query);

      const matchesType =
        !roleType || role.roleType === roleType;

      const matchesReporting =
        !reportingTo ||
        role.reportingTo === reportingTo;

      return (
        matchesSearch &&
        matchesType &&
        matchesReporting
      );
    });
  }, [roles, search, roleType, reportingTo]);

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  function resetFilters() {
    setSearch("");
    setRoleType("");
    setReportingTo("");
  }

  /* =========================================================
     DELETE ROLE
  ========================================================= */

  function deleteRole(id: number) {
    const role = roles.find(
      (item) => item.id === id
    );

    if (!role) return;

    /*
      POS Admin is our main system role.
      We don't allow deleting it.
    */

    if (role.name === "POS Admin") {
      alert(
        "POS Admin is a system role and cannot be deleted."
      );

      return;
    }

    const confirmed = window.confirm(
      `Delete role "${role.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const updatedRoles = roles.filter(
      (item) => item.id !== id
    );

    setRoles(updatedRoles);

    localStorage.setItem(
      "master_roles",
      JSON.stringify(updatedRoles)
    );

  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <div className="admin-eyebrow mb-3">
              04 / Roles
            </div>

            <h1 className="admin-page-title">
              Role Management
            </h1>

            <p className="admin-page-description max-w-xl">
              Create and manage roles and their access
              permissions across the administration system.
            </p>
          </div>

          <Link
            href="/master/roles/add"
            className="admin-btn-primary shrink-0"
          >
            <span className="mr-2 text-lg leading-none">
              +
            </span>

            Add Role
          </Link>

        </div>
      </section>


      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="admin-card mb-6 px-6 py-6">

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* SEARCH */}

          <div>
            <label className="admin-form-label">
              Search Role
            </label>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Role name or description..."
              label="roles"
            />
          </div>


          {/* ROLE TYPE */}

          <div>
            <label className="admin-form-label">
              Role Type
            </label>

            <AdminSelect
              ariaLabel="Role Type"
              value={roleType}
              onChange={setRoleType}
              options={[
                { value: "", label: "All Role Types" },
                { value: "Master Staff", label: "Master Staff" },
                { value: "POS Admin", label: "POS Admin" },
              ]}
            />
          </div>


          {/* REPORTING */}

          <div>
            <label className="admin-form-label">
              Role Reporting To
            </label>

            <AdminSelect
              ariaLabel="Role Reporting To"
              value={reportingTo}
              onChange={setReportingTo}
              options={[
                { value: "", label: "All Reporting Roles" },
                { value: "Master Admin", label: "Master Admin" },
              ]}
            />
          </div>

        </div>


        {/* FILTER BUTTONS */}

        <div className="mt-5 flex justify-end gap-3">

          <button
            type="button"
            onClick={resetFilters}
            className="admin-btn-secondary"
          >
            Reset
          </button>

        </div>

      </section>


      {/* =====================================================
          ROLE TABLE
      ===================================================== */}

      <section className="admin-card overflow-visible">

        {/* CARD HEADER */}

        <div className="border-b border-admin-border px-6 py-5">

          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-admin-text">
            Roles
          </h2>

          <p className="mt-1 text-sm text-admin-muted">
            View roles and manage their permissions.
          </p>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="admin-table min-w-[950px]">

            <thead>
              <tr>

                <th>
                  Role Name
                </th>

                <th>
                  Role Type
                </th>

                <th>
                  Role Description
                </th>

                <th>
                  Role Reporting To
                </th>

                <th>
                  Permissions
                </th>

                <th className="text-right">
                  Action
                </th>

              </tr>
            </thead>


            <tbody>

              {filteredRoles.length > 0 ? (

                filteredRoles.map((role) => {

                  const permissionCount =
                    Object.values(
                      role.permissions || {}
                    ).filter(
                      (permission) =>
                        permission.view ||
                        permission.add ||
                        permission.edit
                    ).length;


                  return (
                    <tr key={role.id}>

                      {/* ROLE NAME */}

                      <td>
                        <div className="font-semibold text-admin-text">
                          {role.name}
                        </div>
                      </td>


                      {/* ROLE TYPE */}

                      <td>

                        <span className="rounded-full bg-admin-primary/10 px-3 py-1.5 text-xs font-semibold text-admin-primary">
                          {role.roleType}
                        </span>

                      </td>


                      {/* DESCRIPTION */}

                      <td>

                        <span className="text-admin-muted">
                          {role.description}
                        </span>

                      </td>


                      {/* REPORTING */}

                      <td>

                        <span className="text-admin-text">
                          {role.reportingTo}
                        </span>

                      </td>


                      {/* PERMISSIONS */}

                      <td>

                        <span className="text-sm font-medium text-admin-muted">
                          {permissionCount} modules
                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="flex justify-end">
                          <ActionMenu
                            label={`Actions for ${role.name}`}
                            width={176}
                            triggerClassName="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-white text-admin-muted transition hover:border-admin-border-strong hover:bg-admin-surface-muted hover:text-admin-primary"
                            triggerContent={<span className="mb-1 text-base font-bold tracking-[2px]">•••</span>}
                          >

                              {/* EDIT */}

                              <Link
                                href={`/master/roles/${role.id}/edit`}
                                role="menuitem"
                                className="flex w-full px-4 py-3 text-sm font-medium text-admin-text transition hover:bg-admin-surface-muted"
                              >
                                Edit Role
                              </Link>


                              {/* DIVIDER */}

                              <div className="border-t border-admin-border" />


                              {/* DELETE */}

                              <button
                                type="button"
                                role="menuitem"
                                onClick={() =>
                                  deleteRole(role.id)
                                }
                                className="flex w-full px-4 py-3 text-left text-sm font-medium text-admin-danger transition hover:bg-admin-danger-surface"
                              >
                                Delete Role
                              </button>

                          </ActionMenu>

                        </div>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>

                  <td colSpan={6}>

                    <div className="py-12 text-center">

                      <div className="text-sm font-semibold text-admin-text">
                        No roles found.
                      </div>

                      <div className="mt-1 text-sm text-admin-muted">
                        Try changing your search or
                        filters.
                      </div>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="border-t border-admin-border bg-admin-surface-muted px-6 py-4">

          <div className="text-xs text-admin-muted">

            Showing{" "}

            <span className="font-semibold text-admin-text">
              {filteredRoles.length}
            </span>{" "}

            of{" "}

            <span className="font-semibold text-admin-text">
              {roles.length}
            </span>{" "}

            roles

          </div>

        </div>

      </section>

    </div>
  );
}