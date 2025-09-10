"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const LoginForm = () => {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && redirect) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password);
      router.replace(redirect || "/booked");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full md:pt-16 pb-4 md:pb-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Sign in
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Access your saved bookings and complete purchases.
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-6xl rounded-3xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-sm px-5 sm:px-6 py-6 md:py-7"
      >
        <div className="max-w-md space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border-0 ring-1 ring-inset ring-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border-0 ring-1 ring-inset ring-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
            {isAuthenticated && user ? (
              <span className="text-xs text-gray-600">
                Signed in as <strong>{user.username}</strong>
              </span>
            ) : null}
          </div>
          {error && (
            <p className="text-sm text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}
          {redirect && !isAuthenticated && (
            <p className="text-[11px] text-gray-500">
              After signing in you&apos;ll be redirected to
              <code className="mx-1 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                {redirect}
              </code>
            </p>
          )}
        </div>
      </form>
    </section>
  );
};

export default LoginForm;
