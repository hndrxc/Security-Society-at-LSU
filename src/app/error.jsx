"use client";
import ErrorPanel from "@/components/layout/ErrorPanel";
import { ActionLink, Button } from "@/components/ui/primitives";
export default function Error({ reset }) {
  return (
    <ErrorPanel
      eyebrow="Request interrupted"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again or go back to the home page."
    >
      <Button onClick={reset}>Try again</Button>
      <ActionLink href="/" variant="secondary">
        Back to home
      </ActionLink>
    </ErrorPanel>
  );
}
