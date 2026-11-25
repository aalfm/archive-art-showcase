# ARTHIVE

**Where Architecture Meets Digital Expression.**

ARTHIVE is a digital architecture showcase platform designed to bring together architects, digital artists, curators, and spatial design enthusiasts through creative exhibitions, curated challenges, and architectural visual exploration.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-1A1917?style=flat-square&logo=nextdotjs&logoColor=F7F5F0)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-1A1917?style=flat-square&logo=react&logoColor=F7F5F0)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-303438?style=flat-square&logo=postgresql&logoColor=F7F5F0)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-303438?style=flat-square&logo=tailwindcss&logoColor=F7F5F0)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-8C7963?style=flat-square)](https://gsap.com/)

[About](#about-the-project) · [Key Features](#key-features) · [Architecture](#application-architecture) · [Database Design](#database-design) · [Getting Started](#getting-started) · [Application Usage](#application-usage)

---

## Project Preview

> **Preview Status:** Application screenshots have not been added to the repository yet.
>
> Planned visual captures for this section:
> - **Homepage Exhibition**: 3D `DepthCarousel` hero, curated gallery grid, active challenges, and featured artists.
> - **Explore & Artwork Detail**: Category filtering, sorting, likes, favorites, and community critique threads.
> - **Role Dashboards**: Dedicated workspaces for Members, Curators, and Administrators.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Application Usage](#application-usage)
- [Security and Access Control](#security-and-access-control)
- [Troubleshooting](#troubleshooting)
- [Future Development](#future-development)
- [Contributing](#contributing)
- [License and Credits](#license-and-credits)

---

## About the Project

ARTHIVE provides a dedicated digital space for architectural visualization, spatial design concepts, and architectural photography. Rather than mixing spatial works into general-purpose social feeds, the platform organizes content around architectural movements, curated design challenges, and structured community critique.

### Objectives

- **Curated Architectural Discovery**: Enable visitors and practitioners to browse works by architectural style (such as Modern, Brutalist, Organic, Parametric, and Sustainable Architecture).
- **Structured Creative Challenges**: Allow verified curators to host time-bound design competitions with defined rules, prizes, and ranked winner selections.
- **Role-Separated Workflows**: Provide distinct workspaces for creators (Members), competition organizers (Curators), and platform moderators (Admins).
- **Editorial Presentation**: Pair an ivory, stone, charcoal, and sand visual palette with motion-driven exhibition components.

### Intended Audience

- **Architects & Spatial Designers** sharing conceptual renders, structural studies, and built-environment photography.
- **Digital Artists** exploring architectural geometry, light, and speculative urban forms.
- **Curators** organizing thematic exhibitions and evaluating community submissions.
- **Enthusiasts & Students** discovering architectural styles and participating in critique.

---

## Key Features

### Public Experience

- **Interactive Exhibition Homepage** (`/`): Features a GSAP-powered 3D `DepthCarousel` hero, a curated artwork gallery (up to 48 active works), active/upcoming challenges, and featured artist profiles.
- **Explore Artworks** (`/explore`): Supports keyword search by artwork title or artist name, architectural category filtering, and sorting by latest or most liked.
- **Artwork Detail Pages** (`/artworks/[id]`): Displays full artwork metadata, tags, category, artist attribution, like counts, community comments, and content reporting.
- **Artist Discovery & Profiles** (`/artists`, `/artists/[id]`): Searchable directory of active members with category filtering, artist bio, external portfolio links, and published artwork collections.
- **Challenge Discovery & Detail** (`/challenges`, `/challenges/[id]`): Filterable listing of active and upcoming challenges backed by `/api/challenges/search`, individual challenge briefs, rules, prize details, submission counts, and ranked winners (1st–3rd place) once judging concludes.

### Member Features

- **Member Dashboard** (`/dashboard/member`): Overview of published artworks, artworks under moderation review, active challenge entries, and recent activity.
- **Artwork Management** (`/dashboard/member/artworks`, `create`, `[id]/edit`): Full create, read, update, and delete workflow for personal artworks, supporting local image uploads (processed via `sharp`) or external image URLs.
- **Favorites Collection** (`/dashboard/member/favorites`): Save and manage bookmarked artworks from across the platform.
- **Challenge Submissions** (`/dashboard/member/submissions`): Submit active artworks to ongoing challenges (one entry per challenge) and withdraw submissions before the challenge end date.
- **Community Interactions**: Like artworks, save favorites, post or delete personal comments, and report inappropriate works (`SARA`, `Plagiarism`, `Inappropriate Content`, or `Other`).
- **Profile & Password Settings** (`/dashboard/member/profile`, `/dashboard/member/settings`): Update display name, bio, external portfolio link, avatar, and account password.

### Curator Features

- **Verification Gate** (`/dashboard/curator/pending`): Newly registered curators are placed in `pending` status until approved by an administrator.
- **Curator Dashboard** (`/dashboard/curator`): Summary metrics for managed challenges, active competitions, and submissions awaiting review.
- **Challenge Management** (`/dashboard/curator/challenges`, `create`, `[id]/edit`): Create, edit, and delete architectural challenges with custom banners, rules, prizes, and start/end schedules.
- **Submission Review & Winner Selection** (`/dashboard/curator/challenges/[id]/submissions`): Inspect all participant entries for owned challenges and assign 1st, 2nd, and 3rd place winners after the challenge end date passes.

### Admin Features

- **Admin Overview** (`/dashboard/admin`): Real-time platform metrics (total non-admin users, pending moderation reports, pending curator applications) and a prioritized review queue.
- **User Management** (`/dashboard/admin/users`): Search users by name or email, filter by role (`member`, `curator`, `admin`), and activate or deactivate non-admin accounts (deactivation immediately revokes active sessions).
- **Curator Verification** (`/dashboard/admin/curators`): Approve or reject pending curator applications.
- **Category Management** (`/dashboard/admin/categories`): Create, rename, and delete architectural categories (deletion is protected when artworks reference the category).
- **Report & Content Moderation** (`/dashboard/admin/reports`): Inspect user-submitted artwork reports and either dismiss reports or take down offending artworks.

> **Implementation Note:** `src/app/api/artworks/search/route.js` is present as an empty placeholder file; artwork search and filtering are currently handled server-side in `src/app/(public)/explore/page.js`.

---

## User Roles and Permissions

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

*\*Administrators are blocked from liking, favoriting, commenting on, or reporting artworks to keep moderation neutral.*

---

## Technology Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | Next.js (App Router) | `16.4.6` | Server/Client Components, routing, SSR |
| **UI Library** | React / React DOM | `19.3.0` | Component rendering and state |
| **Backend** | Next.js Server Actions & Route Handlers | `16.4.6` | Mutations, search API, file upload endpoint |
| **Database** | PostgreSQL (`pg`) | `^8.23.1` | Relational storage and parameterized queries |
| **Authentication** | `jose` + `bcryptjs` | `^6.2.18` / `^3.0.3` | HS256 JWT cookies, DB sessions, password hashing |
| **Styling** | Tailwind CSS + `@tailwindcss/turbopack` | `4.3.3` | Utility styling and custom editorial CSS tokens |
| **Typography & Icons** | Manrope (`next/font/google`), Custom SVGs | — | Editorial typography and UI iconography |
| **Animations** | GSAP | `^3.13.0` | 3D `DepthCarousel` hero transitions |
| **File Storage & Media** | Local filesystem + `sharp` + `uuid` | `^0.35.5` / `^14.0.3` | Image validation, resizing, and `/public/uploads` storage |
| **Linting** | ESLint + `eslint-config-next` | `^9` / `16.4.6` | Code quality and Next.js Core Web Vitals rules |

---

## Application Architecture

ARTHIVE is built as a monolithic Next.js 16 App Router application using Server Components for data-heavy reads, Server Actions for form mutations, Route Handlers for multipart uploads and live challenge search, and PostgreSQL for persistence.

```mermaid
flowchart TD
    Client["Browser (React 19 + GSAP)"]
    Proxy["src/proxy.js (Optimistic JWT Check on /dashboard/*)"]
    Public["Public Routes (/ , /explore, /artworks, /artists, /challenges)"]
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

### Key Architectural Flows

- **Authentication Flow**: Signing in (`loginUser`) verifies the password with `bcryptjs`, checks `users.is_active`, inserts a record into `sessions`, signs an HS256 JWT with `jose`, and stores it in an `httpOnly` cookie (`arthive_session`) valid for 7 days.
- **Two-Layer Route Protection**: `src/proxy.js` performs an optimistic JWT check on `/dashboard/:path*` and redirects unauthenticated requests to `/login`. Authoritative verification runs server-side in `requireAuth()` and `requireRole()` (`src/lib/auth.js`), which join `sessions` and `users` in PostgreSQL to verify session expiry, `is_active = TRUE`, `role`, and `curator_status = 'approved'`.
- **File Upload & Storage**: `POST /api/upload` authenticates the session, validates MIME type (`JPEG`, `PNG`, `WebP`, `GIF`) and file size (max 10 MB), inspects and sanitizes image bytes with `sharp` (auto-orienting and resizing non-GIF images to fit within `2400x2400`), and writes the file with a UUID filename to `public/uploads/`.

---

## Database Design

ARTHIVE uses PostgreSQL (`database/schema.sql`) with 10 normalized tables and foreign-key cascades to maintain referential integrity.

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

### Core Tables

- **`users` & `sessions`**: Stores user credentials, roles (`admin`, `member`, `curator`), curator verification state (`pending`, `approved`, `rejected`), account activation flag (`is_active`), profile metadata, and active server-side sessions.
- **`categories` & `artworks`**: Organizes architectural works with `status` (`active` or `taken_down`), `tags`, `image_url`, and cached `like_count`.
- **`artwork_likes`, `favorites`, `comments`, `reports`**: Tracks unique user likes/favorites, artwork comments, and moderation reports (`pending`, `dismissed`, `taken_down`) with unique `(user_id, artwork_id)` constraints on likes, favorites, and reports.
- **`challenges` & `submissions`**: Stores curator-owned competitions (`end_date > start_date`) and participant entries with uniqueness constraints enforcing one submission per member per challenge and unique `winner_rank` (`1`–`3`) per challenge.

---

## Project Structure

```text
arthive-art-showcase/
├── database/
│   ├── schema.sql                  # PostgreSQL schema, constraints, and indexes
│   └── seed.sql                    # Idempotent demo users, categories, artworks, challenges
├── public/
│   ├── logo/                       # Brand SVGs and favicons
│   └── uploads/                    # Local directory for user-uploaded artwork images
├── src/
│   ├── app/
│   │   ├── (public)/               # Public pages: explore, artworks/[id], artists, challenges, login, register
│   │   ├── api/
│   │   │   ├── artworks/search/    # Placeholder route handler
│   │   │   ├── challenges/search/  # Live challenge search & status counts API
│   │   │   └── upload/             # Authenticated image upload & sharp processing
│   │   ├── dashboard/
│   │   │   ├── admin/              # Admin overview, users, curators, categories, reports
│   │   │   ├── curator/            # Curator overview, pending gate, challenges, submissions
│   │   │   ├── member/             # Member overview, artworks, favorites, submissions, profile, settings, inactive
│   │   │   ├── layout.js           # Shared dashboard shell with sidebar
│   │   │   └── page.js             # Role-based dashboard redirector
│   │   ├── globals.css             # Architectural editorial design tokens and styles
│   │   ├── layout.js               # Root layout with Manrope font
│   │   └── page.js                 # Public homepage
│   ├── components/
│   │   ├── artists/                # Artist directory, navigation, and profile components
│   │   ├── dashboard/              # Account status notices
│   │   ├── home/                   # HeroSection, ArtworkGallery, ChallengesSection, ArtistsSection
│   │   ├── layout/                 # Navbar, Footer, DashboardSidebar, PublicPageContainer
│   │   └── ui/                     # DepthCarousel, ImageUpload, Modal, Toast, Icons, ArtworkCard
│   ├── lib/
│   │   ├── actions/                # Server Actions (admin, artwork, auth, challenge)
│   │   ├── auth.js                 # JWT & DB session helpers, requireAuth, requireRole
│   │   ├── db.js                   # PostgreSQL connection pool and query helper
│   │   └── utils.js                # Positive integer ID validation helpers
│   └── proxy.js                    # Optimistic session cookie guard for /dashboard/*
├── .env.example                    # Environment variable template
├── next.config.mjs                 # Next.js configuration (remote images, 10MB action limit)
└── package.json                    # Dependencies and npm scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **PostgreSQL** 14 or higher
- **npm** (bundled with Node.js)

### Installation

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

   Copy `.env.example` to `.env.local` and update the values for your local PostgreSQL instance and session secret:

   ```bash
   cp .env.example .env.local
   ```

4. **Initialize the database**

   Create the `arthive_db` database and execute the schema and seed scripts (see [Database Setup](#database-setup) for details):

   ```bash
   psql -U postgres -c "CREATE DATABASE arthive_db;"
   psql -U postgres -d arthive_db -f database/schema.sql
   psql -U postgres -d arthive_db -f database/seed.sql
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` in your browser.

### Demo Accounts

The `database/seed.sql` script provisions the following demo accounts for testing each role:

| Role | Email | Password | Status |
|---|---|---|---|
| Admin | `admin@arthive.com` | `Admin@123` | Active |
| Curator | `kurator@arthive.com` | `Curator@123` | Approved |
| Member | `member@arthive.com` | `Member@123` | Active |

---

## Environment Variables

| Variable | Description | Required | Example |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by `pg` Pool in `src/lib/db.js`. | Yes | `postgresql://postgres:your_password@localhost:5432/arthive_db` |
| `SESSION_SECRET` | Secret key (32+ characters recommended) used to sign and verify HS256 JWT cookies. Falls back to a built-in dev string if omitted. | Yes (Production) | `replace-with-a-random-32-char-secret` |
| `NEXT_PUBLIC_APP_URL` | Base URL of the application defined in `.env.example`. | No | `http://localhost:3000` |

---

## Database Setup

Execute the SQL files in order so tables, constraints, and indexes exist before seeding data:

1. **Create the database**

   ```bash
   psql -U postgres -c "CREATE DATABASE arthive_db;"
   ```

2. **Run the schema file**

   ```bash
   psql -U postgres -d arthive_db -f database/schema.sql
   ```

3. **Run the seed file** (safe to re-run; uses `ON CONFLICT` and existence checks)

   ```bash
   psql -U postgres -d arthive_db -f database/seed.sql
   ```

4. **Verify initialization**

   `database/seed.sql` concludes with summary queries that output counts for `users`, `categories`, `artworks`, `artwork_likes`, and `challenges`. You can also verify tables manually:

   ```bash
   psql -U postgres -d arthive_db -c "\dt"
   ```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts the Next.js development server at `http://localhost:3000`. |
| `build` | `npm run build` | Builds the application for production. |
| `start` | `npm run start` | Runs the compiled production server. |
| `lint` | `npm run lint` | Runs ESLint with `eslint-config-next` Core Web Vitals rules. |

---

## Application Usage

- **Public User**: Start on `/` to explore the 3D `DepthCarousel` and curated sections. Use `/explore` to search and filter artworks by category or popularity, `/artists` to browse creator portfolios, and `/challenges` to inspect ongoing competitions and past winners.
- **Member**: Register as a `member` at `/register` or sign in at `/login`. From `/dashboard/member`, upload artworks under **Artworks → Create**, bookmark works on `/artworks/[id]` to view in **Favorites**, enter active competitions from `/challenges/[id]`, and manage your profile or password in **Profile** and **Settings**.
- **Curator**: Register as a `curator` at `/register`. Newly registered curators are routed to `/dashboard/curator/pending` until an Admin approves them. Once approved, access `/dashboard/curator` to create challenges, edit rules and schedules, and rank 1st–3rd place winners after a challenge's end date.
- **Admin**: Sign in and navigate to `/dashboard/admin` to review pending curator applications (`/dashboard/admin/curators`), manage user activation status (`/dashboard/admin/users`), maintain architectural categories (`/dashboard/admin/categories`), and moderate reported artworks (`/dashboard/admin/reports`).

---

## Security and Access Control

- **Session & Cookie Security**: Sessions are persisted in PostgreSQL (`sessions` table) and referenced by an `httpOnly`, `sameSite: 'lax'` JWT cookie (`secure: true` in production). Deactivating a user immediately deletes their rows from `sessions`.
- **Password Hashing**: User passwords are hashed with `bcryptjs` using a salt factor of `12` (`src/lib/actions/auth.actions.js`).
- **Two-Stage Authorization**: `src/proxy.js` guards `/dashboard/*` at the edge, while `requireAuth()` and `requireRole()` enforce database-verified role, `is_active`, and `curator_status` checks in Server Components and Server Actions.
- **Parameterized SQL**: All database queries in `src/lib/db.js` and action modules use parameterized `$1, $2, ...` bindings.
- **Upload Validation**: `/api/upload` requires an authenticated session, enforces a 10 MB limit, checks MIME types (`JPEG`, `PNG`, `WebP`, `GIF`), and re-processes image buffers with `sharp` to verify valid image data and strip metadata.
- **Abuse Prevention**: Users cannot report their own artworks or submit duplicate reports for the same artwork; admins are restricted from social interactions.

---

## Troubleshooting

| Issue | Possible Cause | Resolution |
|---|---|---|
| `[DB] Query error` or connection refused | PostgreSQL is not running or `DATABASE_URL` in `.env.local` is incorrect. | Verify the PostgreSQL service is running and confirm host, port, user, password, and database name (`arthive_db`) in `.env.local`. |
| Redirected to `/login` after signing in | `SESSION_SECRET` mismatch or `database/schema.sql` was not executed (`sessions` table missing). | Ensure `SESSION_SECRET` is set in `.env.local` and run `database/schema.sql`. |
| `sharp` installation or runtime error | Native binary mismatch during `npm install`. | Run `npm rebuild sharp` or reinstall dependencies with Node.js 20+. |
| Port `3000` already in use | Another process is bound to port `3000`. | Stop the conflicting process or start Next.js on another port (`npx next dev -p 3001`). |
| Seed script fails on `categories` or `users` | `database/seed.sql` was executed before `database/schema.sql`. | Run `database/schema.sql` first, then re-run `database/seed.sql`. |

---

## Future Development

The following items represent potential future improvements and are not currently implemented:

- Cloud object storage integration (such as S3 or Cloudflare R2) to replace local `/public/uploads` storage for multi-instance deployments.
- Completing or deprecating the empty `src/app/api/artworks/search/route.js` endpoint for client-side live artwork filtering.
- Automated unit and end-to-end test suites.
- Email notifications for curator application approvals and challenge winner announcements.

---

## Contributing

Contributions are welcome. To propose a change:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Make your changes and verify code quality:

   ```bash
   npm run lint
   npm run build
   ```

4. Commit your changes and open a pull request describing the motivation and scope of the update.

---

## License and Credits

### License

No `LICENSE` file is currently specified in this repository. All rights remain with the repository authors unless a license is added.

### Credits

Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), [PostgreSQL](https://www.postgresql.org/), [Tailwind CSS](https://tailwindcss.com/), [GSAP](https://gsap.com/), [jose](https://github.com/panva/jose), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), and [sharp](https://sharp.pixelplumbing.com/).
