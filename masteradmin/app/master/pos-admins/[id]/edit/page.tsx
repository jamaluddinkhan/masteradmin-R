"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AdminSelect from "@/components/ui/AdminSelect";
import {
  loadPOSAdmins,
  savePOSAdmins,
  type POSAdmin,
  type POSAdminStatus,
} from "@/src/lib/pos-admins";

export default function EditPOSAdminPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [admin, setAdmin] = useState<POSAdmin | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [status, setStatus] = useState<POSAdminStatus>("Active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      const id = Number(params.id);
      const foundAdmin = Number.isSafeInteger(id)
        ? loadPOSAdmins().find((item) => item.id === id) ?? null
        : null;

      setAdmin(foundAdmin);
      if (foundAdmin) {
        setName(foundAdmin.name);
        setEmail(foundAdmin.email);
        setRestaurant(foundAdmin.restaurant ?? "");
        setStatus(foundAdmin.status);
      }
      setLoading(false);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [params.id]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!admin) return;

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || !normalizedEmail) {
      setError("Name and email are required.");
      return;
    }

    const admins = loadPOSAdmins();
    if (admins.some((item) => item.id !== admin.id && item.email.toLowerCase() === normalizedEmail)) {
      setError("This email is already registered.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      savePOSAdmins(admins.map((item) => item.id === admin.id
        ? { ...item, name: normalizedName, email: normalizedEmail, restaurant: restaurant.trim(), status }
        : item));
      router.push("/master/pos-admins");
    } catch {
      setSaving(false);
      setError("Unable to save this POS Admin in browser storage.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-admin-muted">
        <span className="admin-loading-content">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-admin-border border-t-admin-primary" />
          Loading POS Admin...
        </span>
      </div>
    );
  }

  if (!admin) {
    return (
      <section className="admin-card p-6 sm:p-8">
        <h1 className="text-xl font-bold text-admin-text">POS Admin not found</h1>
        <p className="mt-2 text-sm text-admin-muted">This account may have been removed or the link is invalid.</p>
        <Link href="/master/pos-admins" className="admin-btn-secondary mt-5">Back to POS Admins</Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-8">
      <Link href="/master/pos-admins" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-admin-muted hover:text-admin-primary">
        <span aria-hidden="true">←</span> Back to POS Admins
      </Link>
      <h1 className="admin-page-title">Edit POS Admin</h1>
      <p className="admin-page-description mb-7">Update account information and status.</p>

      <form onSubmit={handleSubmit} className="admin-card overflow-hidden">
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">
          <div>
            <label htmlFor="pos-admin-name" className="admin-form-label">POS Admin Name</label>
            <input id="pos-admin-name" value={name} onChange={(event) => setName(event.target.value)} className="admin-input" autoComplete="name" required />
          </div>
          <div>
            <label htmlFor="pos-admin-email" className="admin-form-label">Email</label>
            <input id="pos-admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="admin-input" autoComplete="email" required />
          </div>
          <div>
            <label htmlFor="pos-admin-restaurant" className="admin-form-label">Restaurant</label>
            <input id="pos-admin-restaurant" value={restaurant} onChange={(event) => setRestaurant(event.target.value)} className="admin-input" />
          </div>
          <div>
            <label htmlFor="pos-admin-status" className="admin-form-label">Status</label>
            <AdminSelect
              id="pos-admin-status"
              ariaLabel="Status"
              value={status}
              onChange={(value) => setStatus(value as POSAdminStatus)}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />
          </div>
          {error && <div className="admin-alert-danger px-4 py-3 text-sm sm:col-span-2" role="alert">{error}</div>}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-admin-border bg-admin-surface-muted p-5 sm:flex-row sm:justify-end sm:px-7">
          <Link href="/master/pos-admins" className="admin-btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="admin-btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}