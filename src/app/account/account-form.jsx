"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { signOut } from "./actions";

// Validation helpers
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

function validateUsername(value) {
  if (!value?.trim()) return "Username is required";
  if (!USERNAME_REGEX.test(value)) {
    return "Username must be 3-30 characters, alphanumeric with _ or -";
  }
  return null;
}

function validateFullname(value) {
  if (!value?.trim()) return "Full name is required";
  if (value.trim().length < 2) return "Full name must be at least 2 characters";
  return null;
}

export default function AccountForm({ user, isProfileIncomplete = false }) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const inputClasses =
    "w-full rounded-xl border border-purple-900/60 bg-black/40 px-4 py-3 text-slate-100 placeholder-slate-500 shadow-inner shadow-purple-900/20 focus:border-amber-400 focus:outline-none focus:ring focus:ring-amber-300/30";
  const labelClasses = "text-sm font-semibold text-amber-200";

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setStatus(null);

      if (!user) {
        setFullname("");
        setUsername("");
        setStatus({
          type: "error",
          message: "You need to be signed in to manage your account.",
        });
        return;
      }

      const { data, error, status: statusCode } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (error && statusCode !== 406) {
        throw error;
      }

      if (data) {
        setFullname(data.full_name || "");
        setUsername(data.username || "");
      }
    } catch (error) {
      setStatus({ type: "error", message: "Error loading user data." });
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({ fullname, username }) {
    // Validate inputs before submission
    const fullnameError = validateFullname(fullname);
    const usernameError = validateUsername(username);

    if (fullnameError || usernameError) {
      setValidationErrors({
        fullname: fullnameError,
        username: usernameError,
      });
      return;
    }

    setValidationErrors({});

    try {
      setLoading(true);
      setStatus(null);

      if (!user) {
        setStatus({ type: "error", message: "No user session found." });
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullname,
        username,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatus({ type: "success", message: "Profile updated." });
    } catch (error) {
      setStatus({ type: "error", message: "Error updating the data." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {isProfileIncomplete && (
        <div className="border border-amber-400/50 bg-amber-500/10 p-4 rounded-lg">
          <p className="font-terminal text-sm text-amber-200">
            <span className="text-amber-400">[REQUIRED]</span>
            <span className="ml-2">Complete your profile to access all features.</span>
          </p>
        </div>
      )}
      <div className="grid gap-2">
        <label className={labelClasses} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="text"
          value={user?.email || ""}
          disabled
          className={`${inputClasses} cursor-not-allowed text-slate-400`}
        />
      </div>
      <div className="grid gap-2">
        <label className={labelClasses} htmlFor="fullName">
          Full Name <span className="text-rose-400">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          className={`${inputClasses} ${validationErrors.fullname ? "border-rose-500" : ""}`}
          placeholder="Add your name"
        />
        {validationErrors.fullname && (
          <p className="text-xs text-rose-400">{validationErrors.fullname}</p>
        )}
      </div>
      <div className="grid gap-2">
        <label className={labelClasses} htmlFor="username">
          Username <span className="text-rose-400">*</span>
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`${inputClasses} ${validationErrors.username ? "border-rose-500" : ""}`}
          placeholder="Pick a handle"
          pattern="[a-zA-Z0-9_-]{3,30}"
          title="3-30 characters, letters, numbers, underscore, or hyphen"
        />
        {validationErrors.username && (
          <p className="text-xs text-rose-400">{validationErrors.username}</p>
        )}
      </div>

      {status?.message && (
        <p
          className={`text-sm ${
            status.type === "error" ? "text-rose-300" : "text-amber-200"
          }`}
        >
          {status.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          onClick={() => updateProfile({ fullname, username })}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <form action={signOut} className="flex-1">
          <button
            className="inline-flex w-full items-center justify-center rounded-xl border border-purple-500/60 px-4 py-3 text-sm font-semibold text-purple-100 transition-colors hover:border-purple-400 hover:bg-purple-600 hover:text-white"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
