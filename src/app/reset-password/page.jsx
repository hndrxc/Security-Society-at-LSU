"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LogoBadge from "@/components/LogoBadge";
import { createClient } from "../../../utils/supabase/client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-purple-900/50 bg-[#0f0d16]/90 p-10 text-center shadow-2xl shadow-purple-900/40 backdrop-blur">
          <div className="flex flex-col items-center gap-3">
            <LogoBadge size={48} className="shrink-0" priority />
            <h1 className="text-2xl font-semibold text-white">Loading reset page…</h1>
            <p className="text-sm text-slate-300">Hold on while we prepare your reset link.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const searchParamsString = useMemo(() => searchParams?.toString() ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let ignore = false;

    const establishSessionFromUrl = async () => {
      setChecking(true);
      setStatus(null);

      const hashString =
        typeof window !== "undefined" && window.location.hash ? window.location.hash.substring(1) : "";
      const hashParams = new URLSearchParams(hashString);
      const queryParams = new URLSearchParams(searchParamsString);

      const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") || queryParams.get("refresh_token");
      const code = queryParams.get("code");

      try {
        // Supabase can return tokens in the URL hash (most recovery emails) or a PKCE code query param.
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        const { data, error } = await supabase.auth.getUser();

        if (!ignore) {
          if (error || !data?.user) {
            setStatus({
              type: "error",
              message: "We could not validate this reset link. Request a fresh email and try again.",
            });
            setSessionReady(false);
          } else {
            setSessionReady(true);
          }
        }
      } catch (error) {
        if (!ignore) {
          setStatus({
            type: "error",
            message: "We could not validate this reset link. Request a fresh email and try again.",
          });
          setSessionReady(false);
        }
      } finally {
        if (!ignore) {
          setChecking(false);
        }
      }
    };

    establishSessionFromUrl();

    return () => {
      ignore = true;
    };
  }, [supabase, searchParamsString]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!sessionReady) {
      setStatus({
        type: "error",
        message: "This link is expired or invalid. Request a new reset email to continue.",
      });
      return;
    }

    if (!password || password.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus({ type: "error", message: "Could not update password. Please try again." });
      } else {
        setStatus({
          type: "success",
          message: "Password updated. You can log in with your new password now.",
        });
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setStatus({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-purple-900/60 bg-black/40 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner shadow-purple-900/20 focus:border-amber-400 focus:outline-none focus:ring focus:ring-amber-300/30";
  const labelClasses = "text-sm font-semibold text-amber-200";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0d0a14] to-black text-slate-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-purple-700/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-80px] h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl rounded-3xl border border-purple-900/50 bg-[#0f0d16]/90 p-10 shadow-2xl shadow-purple-900/40 backdrop-blur">
          <div className="flex flex-col items-center gap-3 text-center">
            <LogoBadge size={48} className="shrink-0" priority />
            <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
            <p className="text-sm text-slate-300">Set a new password to get back into your account.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className={labelClasses} htmlFor="password">
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClasses}
                placeholder="Choose something strong"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClasses} htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClasses}
                placeholder="Re-enter your password"
                disabled={loading}
              />
            </div>

            {status?.message && (
              <p className={`text-sm ${status.type === "error" ? "text-rose-300" : "text-amber-200"}`}>
                {status.message}
              </p>
            )}
            {!status && !sessionReady && !checking && (
              <p className="text-sm text-rose-300">
                We could not confirm this reset request. Please send a new email and try again.
              </p>
            )}

            <div className="flex flex-col gap-3 pt-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update password"}
              </button>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-purple-500/60 px-4 py-3 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
