"use client";

import { useMemo, useState } from "react";
import SearchInput from "@/components/ui/SearchInput";
import AdminSelect from "@/components/ui/AdminSelect";

type OrderStatus = "Pending" | "Preparing" | "Completed";

type Order = {
  id: number;
  orderRef: string;
  restaurant: string;
  branch: string;
  amount: string;
  status: OrderStatus;
};

const orders: Order[] = [
  {
    id: 1,
    orderRef: "ORD-MUM-20260927-0001",
    restaurant: "The Taj",
    branch: "Mumbai",
    amount: "₹1,250",
    status: "Completed",
  },
  {
    id: 2,
    orderRef: "ORD-DEL-20260927-0001",
    restaurant: "The Taj",
    branch: "Delhi",
    amount: "₹850",
    status: "Preparing",
  },
  {
    id: 3,
    orderRef: "ORD-GOA-20260927-0001",
    restaurant: "Royal Foods",
    branch: "Goa",
    amount: "₹1,560",
    status: "Pending",
  },
  {
    id: 4,
    orderRef: "ORD-MUM-20260927-0002",
    restaurant: "Jamal Foods",
    branch: "Mumbai",
    amount: "₹920",
    status: "Completed",
  },
  {
    id: 5,
    orderRef: "ORD-PUN-20260927-0001",
    restaurant: "Prashant Kitchen",
    branch: "Pune",
    amount: "₹670",
    status: "Pending",
  },
];

export default function OrdersPage() {
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [status, setStatus] = useState("");

  const filteredOrders = useMemo(() => {
    const restaurantQuery = restaurantSearch.trim().toLowerCase();
    const orderQuery = orderSearch.trim().toLowerCase();

    return orders.filter((order) => {
      const restaurantMatch =
        !restaurantQuery ||
        order.restaurant.toLowerCase().includes(restaurantQuery);

      const orderMatch =
        !orderQuery ||
        order.orderRef.toLowerCase().includes(orderQuery);

      const statusMatch =
        !status || order.status === status;

      return restaurantMatch && orderMatch && statusMatch;
    });
  }, [restaurantSearch, orderSearch, status]);

  const hasFilters =
    restaurantSearch !== "" ||
    orderSearch !== "" ||
    status !== "";

  const clearFilters = () => {
    setRestaurantSearch("");
    setOrderSearch("");
    setStatus("");
  };

  return (
    <main>
      {/* PAGE HEADER */}
      <div className="mb-7">
        <p className="admin-eyebrow mb-2">
          Management
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="admin-page-title">
              Orders
            </h1>

            <p className="admin-page-description">
              View and track all orders across restaurants.
            </p>
          </div>

          <p className="text-sm text-admin-muted">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"}
          </p>
        </div>
      </div>

      {/* SEARCH / FILTERS */}
      <section className="admin-card mb-6 p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-admin-text">
            Search Orders
          </h2>

          <p className="mt-1 text-sm text-admin-muted">
            Find an order by restaurant, reference or status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_220px_auto]">
          {/* RESTAURANT SEARCH */}
          <div className="relative">
            <SearchInput
              value={restaurantSearch}
              onChange={setRestaurantSearch}
              placeholder="Search restaurant..."
              label="restaurants"
            />
          </div>

          {/* ORDER REFERENCE SEARCH */}
          <div className="relative">
            <SearchInput
              value={orderSearch}
              onChange={setOrderSearch}
              placeholder="Search order reference..."
              label="order references"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="relative">
            <AdminSelect
              ariaLabel="Filter by order status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "", label: "All Status" },
                { value: "Pending", label: "Pending" },
                { value: "Preparing", label: "Preparing" },
                { value: "Completed", label: "Completed" },
              ]}
            />

          </div>

          {/* CLEAR FILTER */}
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="admin-btn-secondary min-h-[46px] whitespace-nowrap"
            >
              Clear
            </button>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </section>

      {/* ORDER TABLE */}
      <section className="admin-card overflow-hidden">
        {/* TABLE HEADER */}
        <div className="border-b border-admin-border px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-admin-text">
            Order Overview
          </h2>

          <p className="mt-1 text-sm text-admin-muted">
            All orders placed across the restaurant network.
          </p>
        </div>

        {/* RESPONSIVE TABLE */}
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[850px]">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Restaurant</th>
                <th>Branch</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center"
                  >
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-admin-primary/10">
                        <svg
                          className="h-4 w-4 text-admin-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="7"
                          />
                          <path d="m20 20-4-4" />
                        </svg>
                      </div>

                      <p className="text-sm font-semibold text-admin-text">
                        No orders found
                      </p>

                      <p className="mt-1 text-sm text-admin-muted">
                        Try changing your search or filter.
                      </p>

                      {hasFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 text-sm font-semibold text-admin-primary hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="border-t border-admin-border bg-admin-surface-muted px-5 py-4 sm:px-6">
          <p className="text-sm text-admin-muted">
            Showing{" "}
            <span className="font-semibold text-admin-text">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-admin-text">
              {orders.length}
            </span>{" "}
            orders
          </p>
        </div>
      </section>
    </main>
  );
}
/* =========================================================
   ORDER ROW
   ========================================================= */

function OrderRow({
  order,
}: {
  order: Order;
}) {
  return (
    <tr>
      <td>
        <span className="font-semibold text-admin-primary">
          {order.orderRef}
        </span>
      </td>

      <td>
        <span className="font-medium text-admin-text">
          {order.restaurant}
        </span>
      </td>

      <td>
        <span className="text-admin-muted">
          {order.branch}
        </span>
      </td>

      <td>
        <span className="font-semibold text-admin-text">
          {order.amount}
        </span>
      </td>

      <td>
        <OrderStatus status={order.status} />
      </td>
    </tr>
  );
}

/* =========================================================
   ORDER STATUS
   ========================================================= */

function OrderStatus({
  status,
}: {
  status: OrderStatus;
}) {
  const styles = {
    Pending: {
      wrapper: "bg-admin-warning-surface text-admin-warning",
      dot: "bg-admin-warning",
    },

    Preparing: {
      wrapper: "bg-admin-primary/10 text-admin-primary",
      dot: "bg-admin-primary",
    },

    Completed: {
      wrapper: "bg-admin-success-surface text-admin-success",
      dot: "bg-admin-success",
    },
  };

  const currentStyle = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${currentStyle.wrapper}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${currentStyle.dot}`}
      />

      {status}
    </span>
  );
}
