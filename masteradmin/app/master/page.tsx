"use client";

import { useState } from "react";
import SearchInput from "@/components/ui/SearchInput";

type Status = "Active" | "Inactive";

type Restaurant = {
  id: number;
  restaurant: string;
  email: string;
  branches: number;
  status: Status;
};

const restaurants: Restaurant[] = [
  {
    id: 1,
    restaurant: "Jamal Kitchen",
    email: "jamal@restaurant.com",
    branches: 3,
    status: "Active",
  },
  {
    id: 2,
    restaurant: "Prashant Restaurant",
    email: "prashant@restaurant.com",
    branches: 5,
    status: "Active",
  },
  {
    id: 3,
    restaurant: "Jamal Foods",
    email: "jamalfoods@restaurant.com",
    branches: 2,
    status: "Active",
  },
  {
    id: 4,
    restaurant: "Prashant Foods",
    email: "prashantfoods@restaurant.com",
    branches: 4,
    status: "Inactive",
  },
];

export default function MasterDashboard() {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filteredRestaurants = restaurants.filter(
    (item) =>
      !query ||
      item.restaurant.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query)
  );

  const totalBranches = restaurants.reduce(
    (total, item) => total + item.branches,
    0
  );

  const activeRestaurants = restaurants.filter(
    (item) => item.status === "Active"
  ).length;

  const stats = [
    {
      title: "Total POS Admins",
      value: "12",
      description: "Registered POS Admins",
    },
    {
      title: "Total Restaurants",
      value: restaurants.length,
      description: "Created by POS Admins",
    },
    {
      title: "Total Branches",
      value: totalBranches,
      description: "Across all restaurants",
    },
    {
      title: "Active Restaurants",
      value: activeRestaurants,
      description: "Currently active",
    },
  ];

  return (
    <main className="min-h-full bg-admin-background px-1 pb-10">
      {/* Page heading */}
      <div className="mb-6">
        <p className="admin-eyebrow mb-1.5">
          Overview
        </p>

        <h1 className="admin-page-title">
          Dashboard
        </h1>

        <p className="admin-page-description">
          Overview of POS Admins, restaurants and branches.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>

      {/* Restaurant overview */}
      <section className="admin-card overflow-hidden">
        {/* Section header */}
        <div className="border-b border-admin-border px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-admin-text">
                Restaurant Overview
              </h2>

              <p className="mt-1 text-sm text-admin-muted">
                View restaurants created by POS Admins.
              </p>
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search restaurant or email..."
              label="restaurants"
              className="w-full sm:w-80"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[720px]">
            <thead>
              <tr>
                <TableHeading>Restaurant</TableHeading>
                <TableHeading>POS Admin Email</TableHeading>
                <TableHeading align="center">Branches</TableHeading>
                <TableHeading>Status</TableHeading>
              </tr>
            </thead>

            <tbody>
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((item) => (
                  <RestaurantRow
                    key={item.id}
                    restaurant={item}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm font-semibold text-admin-text">
                      No restaurants found
                    </p>

                    <p className="mt-1 text-sm text-admin-muted">
                      Try another restaurant name or email.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-admin-border bg-admin-surface-muted px-5 py-3.5 sm:px-6">
          <p className="text-sm text-admin-muted">
            Showing{" "}
            <span className="font-semibold text-admin-text">
              {filteredRestaurants.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-admin-text">
              {restaurants.length}
            </span>{" "}
            restaurants
          </p>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Stats Card ---------------- */

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="admin-card px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-admin-card">
      <p className="text-sm font-medium text-admin-muted">
        {title}
      </p>

      <p className="mt-1 text-[34px] font-bold leading-tight tracking-tight text-admin-primary">
        {value}
      </p>

      <p className="mt-1 text-xs text-admin-muted">
        {description}
      </p>
    </div>
  );
}

/* ---------------- Table Heading ---------------- */

function TableHeading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <th
      className={`px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-muted ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* ---------------- Restaurant Row ---------------- */

function RestaurantRow({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  return (
    <tr>
      <td className="px-6 py-4.5">
        <p className="text-sm font-semibold text-admin-text">
          {restaurant.restaurant}
        </p>
      </td>

      <td className="px-6 py-4.5">
        <p className="text-sm text-admin-muted">
          {restaurant.email}
        </p>
      </td>

      <td className="px-6 py-4.5 text-center">
        <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-admin-surface-muted px-3 py-1.5 text-xs font-semibold text-admin-text">
          {restaurant.branches}
        </span>
      </td>

      <td className="px-6 py-4.5">
        <StatusBadge status={restaurant.status} />
      </td>
    </tr>
  );
}

/* ---------------- Status ---------------- */

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  return (
    <span className={status === "Active" ? "status-active" : "status-inactive"}>
      {status}
    </span>
  );
}