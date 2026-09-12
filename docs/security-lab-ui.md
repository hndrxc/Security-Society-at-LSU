# Security Lab UI preview

The UI pass introduces shared graphite surfaces, LSU purple/gold accents, fluid headings, an asymmetric home page, clearer event dates, larger officer portraits, and a consistent competition workspace. Public pages use expressive entrances and hover feedback; member forms remain steady.

## Implementation

- `PageShell`, `PageHeading`, `Panel`, `ActionLink`, `Button`, `Field`, `Badge`, and `Feedback` provide shared layout and controls. CSS variables, container queries, and `clamp()` define the responsive system.
- Base UI supplies the mobile navigation dialog and solve-status toggle group. The dialog loads when the menu first opens, keeping it out of initial desktop loading. Navigation exposes active states and the dialog handles focus restoration and Escape.
- Motion uses `LazyMotion` with a separate feature chunk on public content. Server-rendered content is visible before JavaScript runs, and reduced-motion preferences disable decorative motion.
- CTF category and solve-status filters operate locally. React `Activity` preserves card expansion, inputs, and purchased hints while hidden. Server-confirmed solves update the filters and refresh authoritative progress. The workspace is keyed by competition and user.
- Authentication forms share labels, input styles, and feedback. Password changes wait for session validation. Auth links skip automatic prefetch so background navigation does not consume the existing auth rate limit.
- The existing Supabase profile hook made asynchronous queries inside its auth callback, which could deadlock browser session calls. Queries now run after that callback returns and stale requests cannot overwrite newer state. [Supabase's documented issue](https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0)
- Admin, QR, RON, and error screens use shared colors while retaining their workflows. Officer images keep signed/public storage URLs and provide a visible fallback when the image itself fails.

Existing URLs, Server Action signatures, Supabase schemas, RLS rules, and production data were preserved. Next.js 16.0.10, React 19.2.3, Tailwind 4, and React Compiler remain in place.

## Preview transition experiment

Set `NEXT_PUBLIC_UI_TRANSITIONS=1` **before building** to enable the experiment. The default is disabled. Next.js App Router's bundled React exposes `ViewTransition` through the normal React import, so no canary dependency upgrade was needed.

The experiment shares competition headings between cards and detail pages and animates the content region during navigation, including the leaderboard. Reduced-motion CSS removes the transition animations. Unsupported browsers keep normal navigation. Set the flag to `0` and rebuild to disable it; changing a public environment variable only at runtime does not alter an existing client bundle.

References: [React ViewTransition](https://react.dev/reference/react/ViewTransition), [React Activity](https://react.dev/reference/react/Activity), [Base UI](https://base-ui.com/react/overview/about), [Motion LazyMotion](https://motion.dev/docs/react-lazy-motion).

## Local verification

The browser fixture is an in-memory HTTP substitute for Supabase, bound to `127.0.0.1:54329`. It is used only by test scripts and is not imported by application code. The runner sets fake credentials and a local site URL, overriding `.env.local` for its app subprocess. Fixture tests exercise UI and Server Action behavior; they do not validate real Supabase email delivery or database RLS enforcement.

```sh
npm test
npm run lint
npx playwright install chromium
npm run test:ui
```

`test:ui` starts the local fixture and preview on port 3100 if they are not already running. Use those ports only for this test setup. For an existing Chromium executable, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

For production-mode verification, build with the same fixture environment first:

```sh
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54329 \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=fixture-key \
NEXT_PUBLIC_SITE_URL=http://localhost:3100 \
NEXT_PUBLIC_DISCORD_SERVER_ID= \
NEXT_PUBLIC_UI_TRANSITIONS=0 npm run build
UI_PRODUCTION=1 NEXT_PUBLIC_UI_TRANSITIONS=0 npm run test:ui
```

Repeat with `NEXT_PUBLIC_UI_TRANSITIONS=1` to exercise the opt-in implementation. Stop an existing preview before switching configurations; Playwright reuses a running local server outside CI.

Screenshots and measurements are in `artifacts/ui/`. `tests/ui/capture.cjs` captures mobile, tablet, and desktop views; `tests/ui/performance.cjs` compares production servers on ports 3101 (baseline) and 3100 (current). Measurements use local fixtures and unthrottled Chromium, so they are diagnostic rather than field-performance claims.

## Review artifacts and performance

Validation passed:

- All 14 existing behavioral tests, run directly with `node tests/event-ctf.test.cjs`. [Test output](../artifacts/ui/unit-tests.txt)
- ESLint. [Lint output](../artifacts/ui/lint.txt)
- Production builds with View Transitions [disabled](../artifacts/ui/build-off.txt) and [enabled](../artifacts/ui/build-on.txt).
- All 12 browser scenarios in each production configuration: [disabled, 18.0 seconds](../artifacts/ui/browser-tests-off.txt) and [enabled, 19.7 seconds](../artifacts/ui/browser-tests-on.txt). [Browser report](../artifacts/ui/report/index.html)

Browser coverage includes mobile focus restoration, keyboard and reduced-motion behavior, CTF filters and retained drafts/hints, server-confirmed flag outcomes, breadcrumbs and history, signup/login/reset/profile flows, admin guards and event mutations, secondary admin routes, RON and QR interactions, unavailable content, missing images, narrow layouts, and unsupported View Transitions. Authentication and mutation checks use isolated fixtures as described above.

Open the [before/after gallery](../artifacts/ui/index.html) to compare 11 pages at desktop (1440px), tablet (834px), and mobile (390px) widths. The 66 screenshots include competition detail, leaderboard, account, admin event editing, and QR. All use isolated fixture data; unavailable officer portraits demonstrate the fallback.

The following values are medians of three fresh browser contexts per page against production builds, with transitions disabled. JavaScript includes compressed response bodies for scripts loaded or prefetched within 1.5 seconds. This measures more than the route's initial bundle. [Raw measurements](../artifacts/ui/production-performance.json)

| Page | JS before → after | LCP before → after | CLS before → after |
| --- | --- | --- | --- |
| Home | 214.1 → 247.2 KB | 112 → 92 ms | 0 → 0 |
| Events | 203.3 → 247.2 KB | 144 → 92 ms | 0 → 0 |
| About | 205.3 → 248.5 KB | 136 → 104 ms | 0 → 0 |

The new presentation and interaction dependencies add 33–44 KB in this measurement. Loading the mobile dialog on demand removed approximately 24 KB from the first implementation. These local timings are too small and environment-dependent to establish a user-facing speed improvement; the useful comparison is the measured JavaScript cost and absence of layout shifts in these runs.

Git operations and PR delivery are paused at the user's request. No production deployment is included.
