"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function MasterSessionGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      let isMasterAdmin = false;

      try {
        const userText = localStorage.getItem("user");
        const user: unknown = userText ? JSON.parse(userText) : null;
        isMasterAdmin =
          localStorage.getItem("auth") === "true" &&
          typeof user === "object" &&
          user !== null &&
          "userType" in user &&
          user.userType === "master";
      } catch {
        isMasterAdmin = false;
      }

      if (isMasterAdmin) {
        setReady(true);
      } else {
        router.replace("/login");
      }
    };

    const sessionTimer = window.setTimeout(checkSession, 0);
    return () => window.clearTimeout(sessionTimer);
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-admin-background">
        <div className="admin-loading-content text-sm text-admin-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-admin-border border-t-admin-primary" />
          Checking Master Admin session...
        </div>
      </main>
    );
  }

  return children;
}