import ErrorPanel from "@/components/layout/ErrorPanel";
import { ActionLink } from "@/components/ui/primitives";
export default function ErrorPage() {
  return (
    <ErrorPanel
      eyebrow="Major issue"
      title="Sorry, something went really wrong."
      description="A critical error stopped this page from loading. Please try again in a moment, and reach out if the issue persists."
    >
      <ActionLink href="/">Back to home</ActionLink>
      <ActionLink href="/login" variant="secondary">
        Return to login
      </ActionLink>
      <p className="text-xs lab-muted">
        If this message keeps showing, please contact an admin.
      </p>
    </ErrorPanel>
  );
}
