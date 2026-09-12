"use client";
import { useActionState, useState } from "react";
import AuthFrame from "@/components/layout/AuthFrame";
import {
  ActionLink,
  Button,
  Feedback,
  Field,
} from "@/components/ui/primitives";
import ResetRequest from "./reset-request";
import { authenticate } from "./actions";
const initialState = { type: null, message: null };
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    authenticate,
    initialState,
  );
  const [activeIntent, setActiveIntent] = useState("login");
  return (
    <AuthFrame
      title="Your next challenge starts here."
      description="Log in to submit flags, track your progress, and take part in the Security Society at LSU."
    >
      <p className="lab-eyebrow">Account access</p>
      <h2>Welcome back.</h2>
      <form className="mt-6 space-y-5" action={formAction} aria-busy={pending}>
        <Field
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.message && (
          <Feedback tone={state.type}>{state.message}</Feedback>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            name="intent"
            value="login"
            onClick={() => setActiveIntent("login")}
            disabled={pending}
            className="flex-1"
          >
            {pending && activeIntent === "login" ? "Logging in..." : "Log in"}
          </Button>
          <Button
            variant="secondary"
            type="submit"
            name="intent"
            value="signup"
            onClick={() => setActiveIntent("signup")}
            disabled={pending}
            className="flex-1"
          >
            {pending && activeIntent === "signup"
              ? "Creating account..."
              : "Create account"}
          </Button>
        </div>
      </form>
      <ResetRequest />
      <ActionLink href="/" variant="secondary" className="mt-6">
        Back to home ↗
      </ActionLink>
    </AuthFrame>
  );
}
