# Security Society at LSU

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)

The official web platform for the Security Society at LSU. It combines club information and event scheduling with a multi-competition Capture the Flag platform, authenticated player profiles, and protected administration tools.

## Club Information

- **Website:** [www.cyberclublsu.com](https://www.cyberclublsu.com/)
- **Meetings:** Fridays, 6:00–7:30 PM
- **Location:** PFT 1225
- **Contact:** [securitysocietylsu@protonmail.com](mailto:securitysocietylsu@protonmail.com)

## Features

### Public club experience

- Combined events and CTF hub at `/events`
- Timezone-aware event listings with optional banner images
- About page with officer profiles loaded from Supabase Storage
- Optional Discord server preview and invite link
- Interactive “Spot the Phish” exercise at `/QR`
- Hidden browser-based RON terminal easter egg
- Responsive cyber-themed interface with reduced-motion support

### CTF platform

- Multiple competitions with scheduled start/end times and active-state controls
- Eight challenge categories: web, crypto, forensics, pwn, reversing, misc, OSINT, and steganography
- Easy, medium, hard, and insane difficulty levels
- Server-side flag verification with case-sensitive or case-insensitive matching
- Expected challenge flags stored as SHA-256 hashes; submitted attempts retained for admin review
- Up to three paid hints per challenge, with deductions capped so a solve retains at least 10% of its original value
- Optional attempt limits, challenge attachments, challenge URLs, visibility controls, and custom ordering
- Ranked leaderboards with solve-time tiebreakers and first-blood detection
- Per-user solve and hint progress

### Authentication and administration

- Supabase email/password signup, login, logout, and password reset
- User profiles with required username and full name before CTF participation
- Admin dashboard with competition, challenge, submission, and success-rate statistics
- Competition and challenge management
- Event management with timezone conversion and image upload validation
- Submission review with status filters and pagination
- Competition owner, editor, and viewer collaboration roles
- Admin routes protected by server-side authentication and profile checks

### Security controls

- Row-Level Security policies for profiles, CTF data, collaborators, solves, hints, submissions, and events
- Database-side flag verification and scoring through PostgreSQL functions
- `SECURITY DEFINER` helpers with fixed search paths for non-recursive authorization checks
- Content Security Policy and additional browser security headers
- Auth and CTF request throttling in middleware

> [!NOTE]
> The current rate limiter is an in-memory, per-instance implementation. It is suitable for development or a single long-lived instance, but production serverless deployments should replace it with a distributed store such as Redis or Vercel KV.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router with React Compiler |
| UI | React 19 and Tailwind CSS 4 |
| Database | Supabase PostgreSQL with Row-Level Security |
| Authentication | Supabase Auth through `@supabase/ssr` |
| Storage | Supabase Storage for officer and event media |
| Analytics | Vercel Analytics |
| Deployment | Vercel; Docker development environment included |

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Club landing page and meeting information |
| `/events` | Upcoming club events and CTF competitions |
| `/ctf` | Redirects to the CTF section of `/events` |
| `/ctf/[competitionId]` | Competition challenges, progress, and leaderboard preview |
| `/ctf/[competitionId]/leaderboard` | Full competition leaderboard |
| `/about` | Club information and officer profiles |
| `/QR` | Interactive phishing-awareness exercise |
| `/login` | Login, signup, and password-reset request |
| `/account` | User profile management |
| `/reset-password` | Password update after a reset email |
| `/admin/*` | Protected event, competition, challenge, and submission management |

## Project Structure

```text
src/
├── app/                       # App Router pages, layouts, route handlers, and server actions
│   ├── admin/                 # Protected administration console
│   ├── auth/                  # Email confirmation and sign-out handlers
│   ├── ctf/                   # Competition detail, leaderboard, and CTF actions
│   ├── events/                # Combined public events and CTF hub
│   └── QR/                    # Phishing-awareness exercise
├── components/
│   ├── admin/                 # Admin forms and controls
│   ├── ctf/                   # Challenges, flags, hints, and leaderboards
│   ├── phishing/              # Spot-the-Phish experience
│   └── ron/                   # Hidden terminal and virtual filesystem
└── hooks/                     # Client-side Supabase and Storage hooks

utils/
├── auth/                      # Server-side auth/profile guards
└── supabase/                  # Browser, server, and middleware clients

supabase/
└── migrations/                # Ordered PostgreSQL migrations 001–008
```

## Database

The migrations create seven application tables and extend an existing `profiles` table:

| Table | Purpose |
| --- | --- |
| `profiles` | Usernames, names, email lookup, avatar metadata, and admin status |
| `ctf_competitions` | Competition schedule, rules, state, and ownership |
| `ctf_challenges` | Challenge content, flag hashes, hints, points, and limits |
| `ctf_submissions` | Correct and incorrect player attempts |
| `ctf_solves` | Successful solves and awarded points |
| `ctf_hint_unlocks` | Per-user hint unlocks and point deductions |
| `ctf_competition_collaborators` | Editor/viewer access to competitions |
| `events` | Club event schedules, visibility, and image paths |

Key PostgreSQL functions include:

- `hash_ctf_flag()`
- `verify_ctf_flag()`
- `get_competition_leaderboard()`
- `unlock_hint()`
- `is_admin()`
- `is_competition_owner()`
- `is_competition_collaborator()`
- `is_competition_active()`

## Local Development

### Prerequisites

- Node.js 22 recommended, matching the included Docker image
- npm and a Supabase project
- An existing public `profiles` table keyed to `auth.users`

The migrations expect `profiles` to support the fields used by the application, including `id`, `email`, `username`, `full_name`, `avatar_url`, and `is_admin`. The base `profiles` table/trigger is not created by this repository; migration 001 adds `is_admin` to an existing table.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env.local
```

Required for the application:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Required for password-reset redirects:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional integrations:

```env
NEXT_PUBLIC_DISCORD_SERVER_ID=your-discord-server-id
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/your-invite
NEXT_PUBLIC_OFFICER_BUCKET=officers
```

Restart the development server after changing any `NEXT_PUBLIC_*` value because those values are included in the browser bundle at build time.

### 3. Apply database migrations

Apply the SQL files in `supabase/migrations/` in numerical order, from `001_ctf_system.sql` through `010_ensure_event_image_path.sql`.

> [!CAUTION]
> Migration 003 recreates the `events` table. Review and adapt it before applying the migration sequence to a database that already contains event data.

Migration 009 adds the `events.timezone` column used by the event form and public event schedule. Existing events default to `America/Chicago`.

Migration 010 idempotently ensures `events.image_path` exists in environments where migration 008 was not applied.

Migration 008 adds the event image path but does not create the Storage bucket. In Supabase Storage, create a public `event-media` bucket with:

- Maximum file size: 5 MB
- Allowed types: JPEG, PNG, WebP, and GIF
- Public read access
- Authenticated admin insert, update, and delete policies

Create the officer-photo bucket named by `NEXT_PUBLIC_OFFICER_BUCKET` separately and configure its read policy as needed.

### 4. Configure authentication

Add the local and deployed URLs to the Supabase Auth redirect allow list. Password-reset links return to `/reset-password`, and email confirmations return through `/auth/confirm`.

To grant admin access, set `profiles.is_admin` to `true` for the appropriate user. Admin users must also have a completed username and full name.

### 5. Run the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

### Docker development

```bash
docker compose up --build
```

The Compose configuration mounts the repository into the Node 22 container and exposes the application on port 3000.

## Deployment

The production site is deployed through Vercel Git integration. Configure the same environment variables in the Vercel project and add the production domain to the Supabase Auth redirect allow list.

For event images, create the `event-media` bucket and policies in the production Supabase project. For officer images, configure `NEXT_PUBLIC_OFFICER_BUCKET` and its corresponding bucket.

The middleware rate limiter is not shared across Vercel instances; use a distributed implementation before treating it as a production-grade abuse control.

## License

Licensed under the [Apache License 2.0](LICENSE).

## Maintainer

**Carter Hendricks** — Webmaster, Security Society at LSU

- GitHub: [@hndrxc](https://github.com/hndrxc)
- LinkedIn: [carter-dell-hendricks](https://linkedin.com/in/carter-dell-hendricks)
