<div align="center">

<img src="public/logo/Favicon_archive.svg" alt="ARTHIVE Official Logo" width="76" height="76" />

# ARTHIVE

*Where Architecture Meets Digital Expression.*

A digital space for architectural exploration, creative showcases, and curated design challenges.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-1A1917?style=flat-square&logo=nextdotjs&logoColor=F7F5F0)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-1A1917?style=flat-square&logo=react&logoColor=F7F5F0)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-303438?style=flat-square&logo=postgresql&logoColor=F7F5F0)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-303438?style=flat-square&logo=tailwindcss&logoColor=F7F5F0)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-8C7963?style=flat-square)](https://gsap.com/)

[Overview](#overview) · [Features](#features) · [Showcase](#showcase) · [Architecture](#architecture) · [Tech Stack](#tech-stack) · [Installation](#installation) · [Documentation](#documentation)

[Explore Repository](https://github.com/aalfm/arthive-art-showcase) · [Report Issue](https://github.com/aalfm/arthive-art-showcase/issues)

</div>

---

## Overview

**ARTHIVE** is a digital architecture showcase platform designed to bring together architects, digital artists, curators, and spatial design enthusiasts through creative exhibitions, curated challenges, and architectural visual exploration.

Rather than burying spatial design inside general-purpose social feeds, ARTHIVE structures works around architectural movements—such as Modern, Brutalist, Organic, Parametric, and Sustainable Architecture—while providing dedicated workspaces for **Members**, **Curators**, and **Administrators**.

### Core Objectives

- **Curated Discovery**: Organize architectural renders, spatial studies, and photography by movement, popularity, and creator.
- **Structured Competitions**: Enable verified curators to host time-bound design challenges with rules, prizes, and ranked winners.
- **Role-Separated Governance**: Maintain clear boundaries between public browsing, creator publishing, curatorial judging, and administrative moderation.

---

## Features

### Public Exploration
- **Exhibition Homepage** (`/`): Interactive 3D `DepthCarousel` hero powered by GSAP, curated artwork gallery (up to 48 active works), active challenges, and featured artists.
- **Explore Gallery** (`/explore`): Keyword search by artwork title or artist name, architectural category filtering, and sorting by latest or most liked.
- **Artwork Detail** (`/artworks/[id]`): Full artwork metadata, tags, category, creator attribution, like counts, comments, and content reporting.
- **Artist Directory & Portfolios** (`/artists`, `/artists/[id]`): Searchable directory of active members with category filtering and individual portfolio pages.
- **Challenge Discovery** (`/challenges`, `/challenges/[id]`): Live search and status filtering (`active`, `upcoming`) via `/api/challenges/search`, challenge briefs, and ranked winners (1st–3rd place).

### Member Experience
- **Member Dashboard** (`/dashboard/member`): Overview of published works, artworks under review, active challenge entries, and recent activity.
- **Artwork Studio** (`/dashboard/member/artworks`): Create, edit, and delete personal artworks with local image uploads (`/api/upload` processed via `sharp`) or external image URLs.
- **Favorites & Interactions** (`/dashboard/member/favorites`): Bookmark artworks, like works, post or delete personal comments, and report inappropriate content.
- **Challenge Submissions** (`/dashboard/member/submissions`): Submit active artworks to ongoing challenges (one entry per challenge) and withdraw entries before the deadline.
- **Profile & Security** (`/dashboard/member/profile`, `/dashboard/member/settings`): Manage display name, bio, external portfolio link, avatar, and password.

### Curator Workspace
- **Verification Gate** (`/dashboard/curator/pending`): Newly registered curators await administrator approval before accessing curatorial tools.
- **Curator Dashboard** (`/dashboard/curator`): Metrics for managed challenges, active competitions, and entries awaiting review.
- **Challenge Management** (`/dashboard/curator/challenges`): Create, edit, and delete architectural challenges with custom banners, rules, prizes, and schedules.
- **Judging & Winner Selection** (`/dashboard/curator/challenges/[id]/submissions`): Review participant submissions and assign 1st, 2nd, and 3rd place winners after a challenge ends.

### Admin Management
- **Admin Overview** (`/dashboard/admin`): Real-time platform metrics and prioritized moderation queue.
- **User Management** (`/dashboard/admin/users`): Search users, filter by role, and activate or deactivate non-admin accounts (deactivation revokes active sessions).
- **Curator Verification** (`/dashboard/admin/curators`): Approve or reject pending curator applications.
- **Category Management** (`/dashboard/admin/categories`): Create, rename, and delete architectural categories.
- **Report Moderation** (`/dashboard/admin/reports`): Review user-submitted artwork reports (`SARA`, `Plagiarism`, `Inappropriate Content`, `Other`) and dismiss reports or take down artworks.

<details>
<summary><strong>Detailed Role Permissions Matrix</strong> (click to expand)</summary>

| Capability | Public User | Member | Curator (Pending) | Curator (Approved) | Admin |
|---|---|---|---|---|---|
| Browse artworks, artists, challenges | Yes | Yes | Yes | Yes | Yes |
| Like, favorite, comment, report artworks | No | Yes | Yes | Yes | Restricted* |
| Upload, edit, delete own artworks | No | Yes | No | No | Edit / Delete any |
| Submit & withdraw challenge entries | No | Yes | No | No | No |
| Manage personal profile & password | No | Yes | Yes | Yes | Yes |
| Create, edit, delete own challenges | No | No | No | Yes | Edit / Delete any |
| Select challenge winners (1st–3rd) | No | No | No | Yes | No |
| Approve or reject curator applications | No | No | No | No | Yes |
| Activate or deactivate user accounts | No | No | No | No | Yes (non-admin) |
| Manage categories & moderate reports | No | No | No | No | Yes |

*\*Administrators are restricted from liking, favoriting, commenting on, or reporting artworks to keep moderation neutral.*

</details>

---

## Showcase

> **Visual Captures Pending:** No application screenshots are currently stored in the repository.
>
> When adding genuine captures, place them in `public/` or `docs/` and link them here:
> - **Homepage Exhibition (`/`)** — 3D `DepthCarousel` hero and curated architectural gallery.
> - **Explore & Artwork Detail (`/explore`, `/artworks/[id]`)** — Category filtering, sorting, and community critique.
> - **Challenges & Judging (`/challenges/[id]`)** — Competition briefs, submissions, and 1st–3rd place winners.
> - **Role Dashboards (`/dashboard/*`)** — Member, Curator, and Admin workspaces.

---

## Tech Stack

### Frontend
[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-1A1917?style=flat-square&logo=nextdotjs&logoColor=F7F5F0)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-1A1917?style=flat-square&logo=react&logoColor=F7F5F0)](https://react.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-8C7963?style=flat-square)](https://gsap.com/)

### Backend
[![Node.js](https://img.shields.io/badge/Node.js-20+-303438?style=flat-square&logo=nodedotjs&logoColor=F7F5F0)](https://nodejs.org/)
[![jose](https://img.shields.io/badge/jose-6.2.18-1A1917?style=flat-square)](https://github.com/panva/jose)
[![bcryptjs](https://img.shields.io/badge/bcryptjs-3.0.3-1A1917?style=flat-square)](https://github.com/dcodeIO/bcrypt.js)
[![sharp](https://img.shields.io/badge/sharp-0.35.5-8C7963?style=flat-square)](https://sharp.pixelplumbing.com/)

### Database
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-303438?style=flat-square&logo=postgresql&logoColor=F7F5F0)](https://www.postgresql.org/)
[![node-postgres](https://img.shields.io/badge/pg-8.23.1-303438?style=flat-square)](https://node-postgres.com/)

### Styling
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-303438?style=flat-square&logo=tailwindcss&logoColor=F7F5F0)](https://tailwindcss.com/)
[![Manrope](https://img.shields.io/badge/Font-Manrope-8C7963?style=flat-square)](https://fonts.google.com/specimen/Manrope)

### Tools
[![ESLint](https://img.shields.io/badge/ESLint-9-1A1917?style=flat-square&logo=eslint&logoColor=F7F5F0)](https://eslint.org/)
[![npm](https://img.shields.io/badge/npm-Package_Manager-303438?style=flat-square&logo=npm&logoColor=F7F5F0)](https://www.npmjs.com/)

---

## Architecture

ARTHIVE uses the Next.js 16 App Router as a unified full-stack architecture: Server Components handle data-heavy queries, Server Actions (`src/lib/actions/*.js`) execute authenticated mutations, Route Handlers (`src/app/api/*`) handle multipart image uploads and live challenge search, and PostgreSQL (`src/lib/db.js`) persists application state.

### Application & Auth Flow

```mermaid
flowchart TD
    Client["Browser (React 19 + GSAP)"]
    Proxy["src/proxy.js (Optimistic JWT Check on /dashboard/*)"]
    Public["Public Routes (/, /explore, /artworks, /artists, /challenges)"]
    Dashboard["Protected Dashboards (/dashboard/member, /curator, /admin)"]
    Actions["Server Actions (src/lib/actions/*.js)"]
    API["Route Handlers (/api/upload, /api/challenges/search)"]
    Auth["Auth & RBAC (src/lib/auth.js: getSession, requireRole)"]
    Sharp["sharp Image Processor -> public/uploads/"]
    DB[("PostgreSQL (src/lib/db.js Pool)")]

    Client --> Proxy
    Client --> Public
    Proxy --> Dashboard
    Public --> DB
    Dashboard --> Auth
    Auth --> DB
    Dashboard --> Actions
    Public --> Actions
    Actions --> Auth
    Actions --> DB
    Client --> API
    API --> Auth
    API --> Sharp
    API --> DB
```

- **Two-Layer Authorization**: `src/proxy.js` validates the signed `arthive_session` JWT cookie on `/dashboard/:path*` and redirects unauthenticated visitors to `/login`. Authoritative checks run server-side in `requireAuth()` and `requireRole()` (`src/lib/auth.js`), querying `sessions` and `users` to verify session expiration, `is_active = TRUE`, `role`, and `curator_status = 'approved'`.
- **Upload Pipeline**: `POST /api/upload` verifies the session, checks MIME type (`JPEG`, `PNG`, `WebP`, `GIF`) and file size (max 10 MB), sanitizes and resizes non-GIF images with `sharp` (up to `2400x2400`), and writes UUID-named files to `public/uploads/`.

### Database Relationships

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ ARTWORKS : creates
    USERS ||--o{ CHALLENGES : curates
    USERS ||--o{ SUBMISSIONS : submits
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ FAVORITES : saves
    USERS ||--o{ ARTWORK_LIKES : likes
    USERS ||--o{ REPORTS : files

    CATEGORIES ||--o{ ARTWORKS : classifies
    ARTWORKS ||--o{ ARTWORK_LIKES : receives
    ARTWORKS ||--o{ FAVORITES : bookmarked_in
    ARTWORKS ||--o{ COMMENTS : has
    ARTWORKS ||--o{ REPORTS : subject_of
    ARTWORKS ||--o{ SUBMISSIONS : entered_as
    CHALLENGES ||--o{ SUBMISSIONS : accepts

    USERS {
        int id PK
        varchar name
        varchar email UK
        text password
        varchar role
        varchar curator_status
        boolean is_active
    }
    ARTWORKS {
        int id PK
        int user_id FK
        int category_id FK
        varchar title
        text image_url
        varchar status
        int like_count
    }
    CHALLENGES {
        int id PK
        int curator_id FK
        varchar title
        timestamp start_date
        timestamp end_date
    }
    SUBMISSIONS {
        int id PK
        int challenge_id FK
        int artwork_id FK
        int member_id FK
        int winner_rank
    }
```

---

## Installation

### Prerequisites

- **Node.js** `20+`
- **npm**
- **PostgreSQL** `14+`

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/aalfm/arthive-art-showcase.git
   cd arthive-art-showcase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `DATABASE_URL` and `SESSION_SECRET` in `.env.local`.

4. **Initialize PostgreSQL and start the server**
   ```bash
   psql -U postgres -c "CREATE DATABASE arthive_db;"
   psql -U postgres -d arthive_db -f database/schema.sql
   psql -U postgres -d arthive_db -f database/seed.sql
   npm run dev
   ```
   Open `http://localhost:3000`.

<details>
<summary><strong>Environment Variables (`.env.example`)</strong> (click to expand)</summary>

| Variable | Description | Required | Example |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by `src/lib/db.js`. | Yes | `postgresql://postgres:your_password@localhost:5432/arthive_db` |
| `SESSION_SECRET` | Secret key (32+ chars recommended) for signing HS256 JWT cookies. | Yes (Prod) | `replace-with-a-random-32-char-secret` |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the application. | No | `http://localhost:3000` |

</details>

<details>
<summary><strong>Database Setup & Demo Accounts (`database/seed.sql`)</strong> (click to expand)</summary>

Run `database/schema.sql` before `database/seed.sql`. The seed script is idempotent and provisions 10 tables plus demo accounts:

| Role | Email | Password | Status |
|---|---|---|---|
| Admin | `admin@arthive.com` | `Admin@123` | Active |
| Curator | `kurator@arthive.com` | `Curator@123` | Approved |
| Member | `member@arthive.com` | `Member@123` | Active |

Verify tables after setup:
```bash
psql -U postgres -d arthive_db -c "\dt"
```

</details>

<details>
<summary><strong>Troubleshooting</strong> (click to expand)</summary>

- **Database connection error (`[DB] Query error`)**: Verify PostgreSQL is running and confirm `DATABASE_URL` in `.env.local`.
- **Redirected to `/login` after signing in**: Ensure `database/schema.sql` has been executed (`sessions` table exists) and `SESSION_SECRET` is configured.
- **`sharp` install or upload error**: Run `npm rebuild sharp` using Node.js `20+`.
- **Port `3000` already in use**: Stop the conflicting process or run `npx next dev -p 3001`.
- **Seed script fails**: Execute `database/schema.sql` before `database/seed.sql`.

</details>

---

## Documentation

### Folder Structure

```text
arthive-art-showcase/
├── database/
│   ├── schema.sql                  # PostgreSQL schema, constraints, and indexes
│   └── seed.sql                    # Demo users, categories, artworks, and challenges
├── public/
│   ├── logo/                       # Official ARTHIVE SVGs and favicons
│   └── uploads/                    # Local storage for uploaded artwork images
├── src/
│   ├── app/
│   │   ├── (public)/               # explore, artworks/[id], artists, challenges, login, register
│   │   ├── api/                    # upload, challenges/search, artworks/search (placeholder)
│   │   ├── dashboard/              # admin, curator, and member workspaces
│   │   ├── globals.css             # Editorial design tokens and global styles
│   │   ├── layout.js               # Root layout with Manrope font
│   │   └── page.js                 # Public homepage
│   ├── components/                 # artists, dashboard, home, layout, ui (DepthCarousel, etc.)
│   ├── lib/                        # actions/, auth.js, db.js, utils.js
│   └── proxy.js                    # Optimistic session cookie guard for /dashboard/*
├── .env.example                    # Environment variable template
├── next.config.mjs                 # Next.js configuration
└── package.json                    # Dependencies and scripts
```

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts the Next.js development server at `http://localhost:3000`. |
| `build` | `npm run build` | Builds the application for production. |
| `start` | `npm run start` | Runs the compiled production server. |
| `lint` | `npm run lint` | Runs ESLint with `eslint-config-next` rules. |

### Security and Permissions

- **Session & Cookie Protection**: Sessions are stored in PostgreSQL (`sessions` table) and referenced by an `httpOnly`, `sameSite: 'lax'` JWT cookie (`secure: true` in production). Account deactivation immediately deletes all user sessions.
- **Password Hashing**: Passwords are hashed with `bcryptjs` (salt factor `12`).
- **Parameterized Queries**: All SQL queries in `src/lib/db.js` and `src/lib/actions/*.js` use parameterized `$1, $2, ...` bindings.
- **Upload Sanitization**: `/api/upload` requires authentication, enforces a 10 MB limit, validates MIME types, and re-processes images with `sharp`.

### Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Verify your changes with `npm run lint` and `npm run build`.
4. Commit your changes and open a pull request.

### License & Credits

- **License**: No `LICENSE` file is currently specified in this repository. All rights remain with the repository authors unless a license is added.
- **Credits**: Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), [PostgreSQL](https://www.postgresql.org/), [Tailwind CSS](https://tailwindcss.com/), [GSAP](https://gsap.com/), [jose](https://github.com/panva/jose), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), and [sharp](https://sharp.pixelplumbing.com/).
- **Author**: **aalfm** — [GitHub](https://github.com/aalfm)
