"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest/10">
          <Mail className="text-forest" size={24} />
        </div>
        <h2 className="mb-2 font-heading text-xl font-semibold text-bark">
          Check your email
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          If an account exists for {email}, we&apos;ve sent password reset
          instructions.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-forest hover:underline"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-2 font-heading text-xl font-semibold text-bark">
        Reset your password
      </h2>
      <p className="mb-6 text-sm text-text-muted">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-bark"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-light disabled:opacity-50"
        >
          <Mail size={16} />
          {loading ? "Sending..." : "Send reset link"}
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
