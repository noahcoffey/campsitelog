"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setSuccess(true);
  };

  if (!token) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm text-center">
        <p className="text-sm text-danger">Invalid reset link.</p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-flex items-center gap-1 text-sm text-forest hover:underline"
        >
          Request a new one
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
          <CheckCircle className="text-forest" size={24} />
        </div>
        <h2 className="mb-2 font-heading text-xl font-semibold text-bark">
          Password updated
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          Your password has been reset successfully.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-light"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-heading text-xl font-semibold text-bark">
        Set new password
      </h2>
      <p className="mb-6 text-sm text-text-muted">
        Enter your new password below.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-bark"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-bark"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-bark"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-light disabled:opacity-50"
        >
          <KeyRound size={16} />
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-forest hover:underline"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
