"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/master",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-[18px] w-[18px]"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },

  {
    label: "POS Admins",
    href: "/master/pos-admins",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-[18px] w-[18px]"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 21c.7-4 2.5-6 5.5-6s4.8 2 5.5 6" />
        <path d="M16 11a3 3 0 1 0 0-6" />
        <path d="M17 15c2.2.7 3.5 2.5 4 6" />
      </svg>
    ),
  },

  {
    label: "Staff",
    href: "/master/staff",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-[18px] w-[18px]"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
      </svg>
    ),
  },

  {
    label: "Orders",
    href: "/master/orders",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-[18px] w-[18px]"
      >
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    ),
  },

  {
    label: "Roles",
    href: "/master/roles",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-[18px] w-[18px]"
      >
        <path d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3z" />
        <path d="M9.5 12l1.7 1.7 3.5-3.5" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/master") {
      return pathname === "/master";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="flex w-full flex-col border-b border-admin-border bg-white md:min-h-screen md:w-[250px] md:shrink-0 md:border-b-0 md:border-r">
      {/* BRAND */}

      <div className="flex h-14 items-center border-b border-admin-border px-5 md:h-[76px] md:px-6">
        <div>
          <div className="text-[19px] font-bold tracking-[-0.02em] text-admin-primary">
            ADMIN
          </div>

          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-admin-muted">
            Master Panel
          </div>
        </div>
      </div>

      {/* NAVIGATION */}

      <div className="flex-1 px-2 py-2 md:px-4 md:py-7">
        <div className="mb-3 hidden px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-admin-muted md:block">
          Main Menu
        </div>

        <nav className="flex gap-1.5 overflow-x-auto md:flex-col">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors duration-150 md:gap-3 md:px-3.5 md:py-3 md:text-sm ${
                  active
                    ? "bg-admin-primary text-white"
                    : "text-admin-muted hover:bg-admin-surface-muted hover:text-admin-primary"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                    active
                      ? "bg-white/10 text-white"
                      : "bg-transparent text-admin-muted group-hover:text-admin-primary"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER */}

      <div className="hidden border-t border-admin-border px-5 py-5 md:block">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-admin-subtle">
          Admin Console
        </div>

        <div className="mt-1 text-xs text-admin-muted">
          Master Administration
        </div>
      </div>
    </aside>
  );
}