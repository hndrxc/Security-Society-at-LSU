"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import AuthFrame from "@/components/layout/AuthFrame";
import { Feedback } from "@/components/ui/primitives";
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
    <AuthFrame
      title="Reset your password"
      description="Hold on while we prepare your reset link."
    >
      <p role="status">Loading reset page…</p>
    </AuthFrame>
  );
}

function ResetPasswordContent() {
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let ignore = false;

    // Listen for auth state changes (PASSWORD_RECOVERY event fires when user clicks reset link)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (ignore) return;

      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (session) {
          setSessionReady(true);
          setChecking(false);
        }
      }
    });

    // Also check if there's already a valid session (handles page refresh)
    const checkExistingSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!ignore) {
          if (session) {
            setSessionReady(true);
          }
          setChecking(false);
        }
      } catch {
        if (!ignore) {
          setChecking(false);
        }
      }
    };

    checkExistingSession();

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!sessionReady) {
      setStatus({
        type: "error",
        message:
          "This link is expired or invalid. Request a new reset email to continue.",
      });
      return;
    }

    if (!password || password.length < 8) {
      setStatus({
        type: "error",
        message: "Password must be at least 8 characters.",
      });
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
        setStatus({
          type: "error",
          message: "Could not update password. Please try again.",
        });
      } else {
        setStatus({
          type: "success",
          message:
            "Password updated. You can log in with your new password now.",
        });
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "lab-input";
  const labelClasses = "text-sm font-medium";

  return (
    <AuthFrame
      title="Reset your password"
      description="Set a new password to get back into your account."
    >
      <p className="lab-eyebrow">Account recovery</p>
      <h2>Choose a new password.</h2>
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
          <Feedback tone={status.type}>{status.message}</Feedback>
        )}
        {!status && !sessionReady && !checking && (
          <p className="text-sm text-rose-300">
            We could not confirm this reset request. Please send a new email and
            try again.
          </p>
        )}

        <div className="flex flex-col gap-3 pt-1">
          <button
            type="submit"
            className="lab-button lab-button--primary w-full"
            disabled={loading || checking || !sessionReady}
          >
            {checking
              ? "Checking session..."
              : loading
                ? "Updating..."
                : "Update password"}
          </button>
          <Link
            href="/login"
            prefetch={false}
            className="lab-button lab-button--secondary w-full"
          >
            Back to login
          </Link>
        </div>
      </form>
    </AuthFrame>
  );
}
