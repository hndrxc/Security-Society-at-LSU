# Security Society at LSU

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white)

A full-stack CTF competition platform and club website for the Security Society at LSU. Features real-time leaderboards, secure flag validation, multi-admin collaboration, and event management.

## 🔗 Live Site

**[cyberclublsu.com](https://cyberclublsu.com)**

---

## Features

### CTF Platform
- **Multi-competition support** with configurable start/end times
- **8 challenge categories**: web, crypto, forensics, pwn, reversing, misc, osint, steganography
- **4 difficulty levels**: easy, medium, hard, insane
- **Secure flag validation** using SHA256 hashing—plaintext flags never stored
- **Hint system** with configurable point costs and 10% minimum point preservation
- **Real-time leaderboards** with first blood detection and solve-time tiebreakers
- **Attempt limiting** and challenge visibility controls

### Security
- Row-Level Security (RLS) policies on all 8 database tables
- Rate limiting middleware (10 req/min auth, 30 req/min submissions)
- Content Security Policy headers
- `SECURITY DEFINER` functions to prevent RLS bypass attacks

### Admin Tools
- Dashboard with competition and submission statistics
- CRUD for competitions, challenges, and events
- Multi-admin collaboration with editor/viewer roles
- Flag submission review interface

### Club Features
- Event management with timezone-aware scheduling
- Officer showcase and club information
- Discord integration

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TailwindCSS 4 |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Deployment | Vercel |
| Auth | Supabase Auth (email/password) |

---

## Architecture

```
src/
├── app/                    # 16 routes (App Router)
│   ├── ctf/               # Competition pages
│   ├── admin/             # Protected admin routes
│   ├── events/            # Event listing
│   └── login/             # Auth flows
├── components/            # 18 React components
└── hooks/                 # Custom hooks (auth, storage)

utils/
├── supabase/              # Client configs (server/client/middleware)
└── auth/                  # Auth utilities

supabase/
└── migrations/            # 7 SQL migrations (schema, RLS, functions)
```

### Database Schema

8 tables with comprehensive RLS policies:

- `profiles` — User metadata and admin flags
- `ctf_competitions` — Competition configuration
- `ctf_challenges` — Challenge data with hashed flags
- `ctf_submissions` — Attempt logging with IP tracking
- `ctf_solves` — Successful solves with point calculation
- `ctf_hint_unlocks` — Hint purchase records
- `ctf_competition_collaborators` — Multi-admin access
- `events` — Club event scheduling

### Key Database Functions

| Function | Purpose |
|----------|---------|
| `verify_ctf_flag()` | Validates submissions, calculates points, detects first blood |
| `get_competition_leaderboard()` | Ranked query with solve-time tiebreaker |
| `unlock_hint()` | Hint purchase with point deduction |
| `hash_ctf_flag()` | SHA256 hashing for flag storage |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

Deployed via Vercel Git integration. Set environment variables in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_DISCORD_SERVER_ID`
- `NEXT_PUBLIC_DISCORD_INVITE`

---

## Stats

- **58 source files**
- **~7,300 lines** of frontend code
- **~1,200 lines** of SQL migrations
- **8 database tables** with RLS
- **6 PL/pgSQL functions**

---

## Author

**Carter Hendricks** — Webmaster, Security Society at LSU

- GitHub: [@hndrxc](https://github.com/hndrxc)
- LinkedIn: [carter-dell-hendricks](https://linkedin.com/in/carter-dell-hendricks)