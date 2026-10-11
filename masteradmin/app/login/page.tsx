"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const MASTER_EMAIL = "master@admin.com";
const MASTER_PASSWORD = "Master@123";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    if (
      email.trim().toLowerCase() === MASTER_EMAIL &&
      password === MASTER_PASSWORD
    ) {
      const user = {
        name: "Jamaluddin Khan",
        email: MASTER_EMAIL,
        role: "Master Admin",
        userType: "master",
      };

      // Save logged-in user
      localStorage.setItem("auth", "true");
      localStorage.setItem("user", JSON.stringify(user));

      // Small loading delay
      setTimeout(() => {
        router.push("/master");
      }, 500);

      return;
    }

    setLoading(false);
    setError("Invalid email or password");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-background px-4">
      <div className="admin-card w-full max-w-md p-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-admin-primary">
            ADMIN
          </h1>

          <p className="mt-1 text-sm text-admin-muted">
            Master Admin Login
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="admin-form-label">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="admin-input"
              placeholder="Enter email"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="admin-form-label">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="admin-input"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="admin-alert-danger px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Forgot Password */}
        <button
          type="button"
          onClick={() => {
            alert(
              "Please contact Master Admin to reset the password."
            );
          }}
          className="mt-5 w-full text-sm text-admin-muted transition hover:text-admin-text hover:underline"
        >
          Forgot Password?
        </button>
      </div>
    </main>
  );
}