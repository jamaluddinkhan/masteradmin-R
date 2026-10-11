export type POSAdminStatus = "Active" | "Inactive";

export type POSAdmin = {
  id: number;
  name: string;
  email: string;
  restaurant?: string;
  role?: string;
  status: POSAdminStatus;
};

const POS_ADMINS_STORAGE_KEY = "master_pos_admins";

export const DEFAULT_POS_ADMINS: POSAdmin[] = [
  {
    id: 1,
    name: "Jamal",
    email: "jamal@admin.com",
    restaurant: "Jamal Kitchen",
    status: "Active",
  },
  {
    id: 2,
    name: "Prashant",
    email: "prashant@admin.com",
    restaurant: "Prashant Restaurant",
    status: "Active",
  },
  {
    id: 3,
    name: "Rahul",
    email: "rahul@admin.com",
    restaurant: "Royal Foods",
    status: "Inactive",
  },
];

function isPOSAdmin(value: unknown): value is POSAdmin {
  if (typeof value !== "object" || value === null) return false;

  const admin = value as Record<string, unknown>;
  return (
    typeof admin.id === "number" &&
    typeof admin.name === "string" &&
    typeof admin.email === "string" &&
    (admin.status === "Active" || admin.status === "Inactive")
  );
}

export function loadPOSAdmins(): POSAdmin[] {
  try {
    const savedAdmins = window.localStorage.getItem(POS_ADMINS_STORAGE_KEY);

    if (savedAdmins !== null) {
      const parsedAdmins: unknown = JSON.parse(savedAdmins);
      if (Array.isArray(parsedAdmins) && parsedAdmins.every(isPOSAdmin)) {
        return parsedAdmins;
      }
    }

    savePOSAdmins(DEFAULT_POS_ADMINS);
  } catch {
    return DEFAULT_POS_ADMINS;
  }

  return DEFAULT_POS_ADMINS;
}

export function savePOSAdmins(admins: POSAdmin[]): void {
  window.localStorage.setItem(POS_ADMINS_STORAGE_KEY, JSON.stringify(admins));
}