"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";

export default function AccountForm({ user }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState(null);

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
        setWebsite("");
        setStatus({
          type: "error",
          message: "You need to be signed in to manage your account.",
        });
        return;
      }

      const { data, error, status: statusCode } = await supabase
        .from("profiles")
        .select("full_name, username, website, avatar_url")
        .eq("id", user.id)
        .single();

      if (error && statusCode !== 406) {
        throw error;
      }

      if (data) {
        setFullname(data.full_name || "");
        setUsername(data.username || "");
        setWebsite(data.website || "");
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

  async function updateProfile({ username, website }) {
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
        website,
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
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          className={inputClasses}
          placeholder="Add your name"
        />
      </div>
      <div className="grid gap-2">
        <label className={labelClasses} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClasses}
          placeholder="Pick a handle"
        />
      </div>
      <div className="grid gap-2">
        <label className={labelClasses} htmlFor="website">
          Website
        </label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className={inputClasses}
          placeholder="https://"
        />
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
          onClick={() => updateProfile({ username, website })}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
        <form action="/auth/signout" method="post" className="flex-1">
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
