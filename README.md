<div align="center">

<img src="public/logo/Favicon_archive.svg" alt="ARTHIVE Official Architectural Emblem" width="84" height="84" />

# ARTHIVE

### *Where Architecture Meets Digital Expression.*

A digital space for architectural exploration, creative showcases, and curated design challenges.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-1A1917?style=for-the-badge&logo=nextdotjs&logoColor=F7F5F0)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-303438?style=for-the-badge&logo=react&logoColor=F7F5F0)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-1A1917?style=for-the-badge&logo=postgresql&logoColor=B5A284)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-303438?style=for-the-badge&logo=tailwindcss&logoColor=F7F5F0)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-8C7963?style=for-the-badge&logo=greensock&logoColor=F7F5F0)](https://gsap.com/)

[![Status](https://img.shields.io/badge/Status-Active_Development-8C7963?style=flat-square)](https://github.com/aalfm/arthive-art-showcase)
[![Version](https://img.shields.io/badge/Version-0.1.0-B5A284?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/License-Unspecified-626A6D?style=flat-square)](#license)

<br />

[About The Project](#about-the-project) · [Features](#features) · [Preview](#preview) · [Tech Stack](#tech-stack) · [System Architecture](#system-architecture) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Usage](#usage)

[Explore Repository](https://github.com/aalfm/arthive-art-showcase) · [Report an Issue](https://github.com/aalfm/arthive-art-showcase/issues) · [Request a Feature](https://github.com/aalfm/arthive-art-showcase/issues)

</div>

---

## About The Project

**ARTHIVE** is an architectural digital showcase platform built to connect architects, digital artists, curators, and spatial design enthusiasts within a dedicated exhibition environment.

### Background & Problem Solved

General-purpose social platforms flatten architectural visualization and spatial concepts into transient feeds with little structural context. **ARTHIVE** solves this by indexing works around architectural movements—such as *Modern*, *Brutalist*, *Organic*, *Parametric*, and *Sustainable Architecture*—while separating creative publishing, curatorial competitions, and platform governance into purposeful workspaces.

### Platform Goals & Experience

- **Visitors & Enthusiasts**: Experience an editorial gallery powered by a 3D depth carousel, category exploration, artist portfolios, and open design competitions.
- **Members & Creators**: Publish architectural works, curate personal collections, participate in community critique, and compete in themed challenges.
- **Curators**: Undergo verified credential review (portfolio and CV), organize time-bound challenges, evaluate entries, and select ranked winners.
- **Administrators**: Govern platform integrity through multi-attempt curator verification, user account status management, category curation, and content report moderation.

```mermaid
flowchart LR
    V["🏛️ Public Visitor\nExplore Works & Artists"] -->|"Sign Up"| M["🎨 Member / Creator\nPublish Works & Compete"]
    V -->|"Apply with Portfolio & CV"| CP["⏳ Curator Applicant\nPending Admin Review"]
    CP -->|"Approved"| CA["🏆 Approved Curator\nHost Challenges & Judge"]
    CP -->|"Rejected with Reason"| CR["🔄 Reapplication Flow\nUpdate Credentials & Retry"]
    CR --> CP
    AD["🛡️ Administrator\nVerify Curators & Moderate"] -->|"Review"| CP
    AD -->|"Moderate Reports & Users"| M

    classDef charcoal fill:#1A1917,stroke:#B5A284,color:#F7F5F0,stroke-width:1.5px;
    classDef sand fill:#B5A284,stroke:#1A1917,color:#1A1917,stroke-width:1.5px;
    classDef slate fill:#303438,stroke:#B5A284,color:#EAE7E0,stroke-width:1.5px;
    classDef stone fill:#626A6D,stroke:#1A1917,color:#F7F5F0,stroke-width:1.5px;
    classDef ivory fill:#F7F5F0,stroke:#8C7963,color:#1A1917,stroke-width:1.5px;

    class V ivory;
    class M sand;
    class CP,CR stone;
    class CA charcoal;
    class AD slate;
```

---

## Features

<table>
<tr>
<td width="50%" valign="top">

### 🏛️ Public / Guest
- **3D Exhibition Hero (`/`)**: Interactive GSAP-animated `DepthCarousel`, curated gallery (up to 48 active works), active challenges, and featured creators.
- **Explore Gallery (`/explore`)**: Search works by title or artist name, filter by architectural category, and sort by latest or most liked.
- **Artwork Detail (`/artworks/[id]`)**: High-resolution presentation with tags, category attribution, like counter, community comments, and related creator works.
- **Artist Directory (`/artists`, `/artists/[id]`)**: Discover active creators, filter by architectural specialty, and inspect portfolio links.
- **Challenge Hub (`/challenges`, `/challenges/[id]`)**: Live search and status tabs (`active`, `upcoming`) backed by `/api/challenges/search`, rules, prizes, and ranked winners.

</td>
<td width="50%" valign="top">

### 🎨 Member / Creator
- **Member Overview (`/dashboard/member`)**: Track published works, artworks under moderation review, active challenge entries, and recent activity.
- **Artwork Studio (`/dashboard/member/artworks`)**: Create, edit, and delete artworks using local uploads (`/api/upload` processed with `sharp`) or external image URLs.
- **Social & Collections (`/dashboard/member/favorites`)**: Like artworks, bookmark favorites, post or delete personal comments, and submit content reports.
- **Challenge Participation (`/dashboard/member/submissions`)**: Enter active artworks into ongoing competitions (one entry per challenge) and withdraw before the deadline.
- **Profile & Security (`/dashboard/member/profile`, `settings`)**: Customize avatar, bio, external portfolio URL, and account password.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🏆 Curator
- **Credentialed Onboarding (`/dashboard/curator/pending`)**: Register with a required portfolio URL and CV (`.pdf`, `.doc`, `.docx` up to 5 MB or external link); rejected applicants can review reasons and reapply.
- **Curator Overview (`/dashboard/curator`)**: Monitor owned challenges, active schedules, and submissions awaiting evaluation.
- **Challenge Authoring (`/dashboard/curator/challenges`)**: Create, edit, and delete architectural competitions with banners, rules, prizes, and schedules.
- **Judging & Winner Assignment (`/dashboard/curator/challenges/[id]/submissions`)**: Evaluate entries and assign 1st, 2nd, and 3rd place winners with optional jury notes after the challenge ends.

</td>
<td width="50%" valign="top">

### 🛡️ Administrator
- **Admin Overview (`/dashboard/admin`)**: Real-time platform metrics and a prioritized queue of pending reports and curator applications.
- **Curator Verification (`/dashboard/admin/curators`, `[id]`)**: Inspect portfolio links, view or download private CV files securely, review attempt history, and approve or reject applications.
- **User Governance (`/dashboard/admin/users`, `[id]`)**: Search accounts, filter by role, and activate or deactivate non-admin users (revoking active sessions immediately).
- **Content & Challenge Oversight (`/dashboard/admin/reports`, `artworks`, `challenges`, `categories`)**: Manage categories, monitor platform challenges, assign/clear winners if needed, dismiss reports, or take down offending artworks.

</td>
</tr>
</table>

<details>
<summary><strong>Interactive Matrix: Role Permissions & Access Rules</strong></summary>

<br />

| Capability | Public / Guest | Member | Curator (Pending / Rejected) | Curator (Approved) | Administrator |
|---|---|---|---|---|---|
| Browse public gallery, artists, and challenges | Yes | Yes | Yes | Yes | Yes |
| Like, favorite, comment on, or report artworks | No | Yes | Yes | Yes | Restricted* |
| Create, edit, and delete own artworks | No | Yes | No | No | Edit / Delete any |
| Submit and withdraw challenge entries | No | Yes | No | No | No |
| Update personal profile and password | No | Yes | Yes | Yes | Yes |
| Submit curator reapplication with CV & portfolio | No | No | Rejected only | No | No |
| Create, edit, and delete own challenges | No | No | No | Yes | Edit / Delete any |
| Assign or clear challenge winners (1st–3rd) | No | No | No | Own challenges | Any challenge |
| Verify curator applications & inspect private CVs | No | No | No | No | Yes |
| Activate or deactivate non-admin accounts | No | No | No | No | Yes |
| Manage categories & moderate reported artworks | No | No | No | No | Yes |

*\*Administrators are blocked from liking, favoriting, commenting on, or reporting artworks to preserve moderation neutrality.*

</details>

<details>
<summary><strong>Implementation Notes: Endpoints & Current Status</strong></summary>

<br />

- `POST /api/upload`: Authenticated endpoint validating MIME type (`JPEG`, `PNG`, `WebP`, `GIF`) and file size (max `10 MB`), sanitizing and resizing non-GIF images with `sharp` up to `2400x2400`, and saving UUID files to `public/uploads/`.
- `GET /api/challenges/search`: Live search endpoint returning active/upcoming challenges and status counts.
- `GET /api/curator-applications/[id]/cv`: Protected CV retrieval endpoint strictly restricted to authenticated Admins and the application owner (`401`/`403` enforced, `Cache-Control: private, no-store`).
- `src/app/api/artworks/search/route.js`: Exists as an empty placeholder file; artwork search and filtering currently run server-side in `src/app/(public)/explore/page.js`.

</details>

---

## Preview

> **Repository Screenshot Status:** No genuine application UI screenshots are currently stored in the repository (only brand logos in `public/logo/` and uploaded artwork media in `public/uploads/` exist).
>
> To preserve accuracy, no stock images or fabricated captures are displayed. Once real screenshots are captured and placed in `docs/screenshots/` or `public/`, populate the gallery below.

<table>
<tr>
<td align="center" width="50%">
<strong>🏛️ Landing Page & 3D Hero</strong><br />
<sub><code>docs/screenshots/home.png</code> (Pending)</sub><br />
<sub>GSAP 3D <code>DepthCarousel</code> exhibition, curated gallery, featured challenges, and artist showcase.</sub>
</td>
<td align="center" width="50%">
<strong>🔍 Explore & Artwork Detail</strong><br />
<sub><code>docs/screenshots/explore.png</code> (Pending)</sub><br />
<sub>Category filtering, sorting, high-resolution artwork view, likes, favorites, and critique comments.</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<strong>🏆 Challenges & Winner Podium</strong><br />
<sub><code>docs/screenshots/challenges.png</code> (Pending)</sub><br />
<sub>Live challenge discovery, competition briefs, submission flow, and 1st–3rd place winners.</sub>
</td>
<td align="center" width="50%">
<strong>📊 Role-Based Dashboards</strong><br />
<sub><code>docs/screenshots/dashboards.png</code> (Pending)</sub><br />
<sub>Dedicated workspaces for Member Studios, Curator Judging, and Admin Governance.</sub>
</td>
</tr>
</table>

---

## Tech Stack

### Frontend & UI / Styling
[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-1A1917?style=flat-square&logo=nextdotjs&logoColor=F7F5F0)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-303438?style=flat-square&logo=react&logoColor=F7F5F0)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-303438?style=flat-square&logo=tailwindcss&logoColor=F7F5F0)](https://tailwindcss.com/)
[![Turbopack](https://img.shields.io/badge/@tailwindcss/turbopack-4.3.3-626A6D?style=flat-square&logo=tailwindcss&logoColor=F7F5F0)](https://tailwindcss.com/)
[![Manrope](https://img.shields.io/badge/Font-Manrope-B5A284?style=flat-square&logo=googlefonts&logoColor=1A1917)](https://fonts.google.com/specimen/Manrope)

### Backend, Database & Authentication
[![Node.js](https://img.shields.io/badge/Node.js-20+-1A1917?style=flat-square&logo=nodedotjs&logoColor=B5A284)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-303438?style=flat-square&logo=postgresql&logoColor=F7F5F0)](https://www.postgresql.org/)
[![node-postgres](https://img.shields.io/badge/pg-8.23.1-303438?style=flat-square&logo=postgresql&logoColor=B5A284)](https://node-postgres.com/)
[![jose](https://img.shields.io/badge/jose_(JWT)-6.2.18-8C7963?style=flat-square&logo=jsonwebtokens&logoColor=F7F5F0)](https://github.com/panva/jose)
[![bcryptjs](https://img.shields.io/badge/bcryptjs-3.0.3-626A6D?style=flat-square)](https://github.com/dcodeIO/bcrypt.js)

### Libraries, Components & Development Tools
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-8C7963?style=flat-square&logo=greensock&logoColor=F7F5F0)](https://gsap.com/)
[![sharp](https://img.shields.io/badge/sharp-0.35.5-8C7963?style=flat-square)](https://sharp.pixelplumbing.com/)
[![uuid](https://img.shields.io/badge/uuid-14.0.3-626A6D?style=flat-square)](https://github.com/uuidjs/uuid)
[![ESLint](https://img.shields.io/badge/ESLint-9-303438?style=flat-square&logo=eslint&logoColor=F7F5F0)](https://eslint.org/)
[![eslint-config-next](https://img.shields.io/badge/eslint--config--next-16.4.6-1A1917?style=flat-square&logo=nextdotjs&logoColor=F7F5F0)](https://nextjs.org/)

<details>
<summary><strong>Detailed Stack Breakdown by Layer</strong></summary>

<br />

| Layer | Technologies Used | Purpose in ARTHIVE |
|---|---|---|
| **Frontend** | Next.js `16.4.6` (App Router), React `19.3.0`, React DOM `19.3.0` | Server Components, Client Components, dynamic routing, SSR |
| **Backend** | Next.js Server Actions & Route Handlers (`Node.js` 20+) | Form mutations, live search API, multipart upload & CV retrieval |
| **Database** | PostgreSQL `14+`, `pg` `^8.23.1` | Connection pooling (`src/lib/db.js`), parameterized SQL, 11 tables |
| **Authentication** | `jose` `^6.2.18`, `bcryptjs` `^3.0.3`, `sessions` table | HS256 JWT `httpOnly` cookies, salt-12 hashing, session revocation |
| **UI / Styling** | Tailwind CSS `4.3.3`, `@tailwindcss/turbopack`, `globals.css`, Manrope | Architectural editorial palette (`#F7F5F0`, `#1A1917`, `#B5A284`) |
| **Libraries & Components** | `gsap` `^3.13.0`, `sharp` `^0.35.5`, `uuid` `^14.0.3`, Custom SVGs | 3D `DepthCarousel`, image sanitization/resizing, UUID filenames |
| **Development Tools** | `eslint` `^9`, `eslint-config-next` `16.4.6`, npm | Core Web Vitals linting and dependency management |

</details>

---

## System Architecture

ARTHIVE follows a unified Next.js App Router architecture where Server Components query PostgreSQL directly, Server Actions execute validated database transactions, and Route Handlers process binary file uploads and live queries.

```mermaid
flowchart TD
    Browser["🌐 Browser Client (React 19 + GSAP)"]
    Proxy["🛡️ src/proxy.js\nOptimistic JWT Check on /dashboard/*"]
    Public["🏛️ Public App Routes\n/, /explore, /artworks, /artists, /challenges"]
    Dash["📊 Protected Dashboards\n/dashboard/member, /curator, /admin"]
    Auth["🔐 Auth & RBAC (src/lib/auth.js)\ngetSession, requireAuth, requireRole"]
    Actions["⚙️ Server Actions (src/lib/actions/*.js)\nauth, artwork, challenge, curator, admin"]
    UploadAPI["🖼️ POST /api/upload\nsharp Validation -> public/uploads/"]
    CvAPI["📄 GET /api/curator-applications/[id]/cv\nPrivate Storage -> storage/curator-cvs/"]
    SearchAPI["🔍 GET /api/challenges/search\nLive Query & Counts"]
    DB[("🗄️ PostgreSQL\nsrc/lib/db.js Pool (11 Tables)")]

    Browser --> Proxy
    Browser --> Public
    Proxy --> Dash
    Public --> DB
    Dash --> Auth
    Auth --> DB
    Dash --> Actions
    Public --> Actions
    Actions --> Auth
    Actions --> DB
    Browser --> UploadAPI
    Browser --> CvAPI
    Browser --> SearchAPI
    UploadAPI --> Auth
    CvAPI --> Auth
    SearchAPI --> DB
    Actions --> DB

    classDef charcoal fill:#1A1917,stroke:#B5A284,color:#F7F5F0,stroke-width:1.5px;
    classDef sand fill:#B5A284,stroke:#1A1917,color:#1A1917,stroke-width:1.5px;
    classDef slate fill:#303438,stroke:#B5A284,color:#EAE7E0,stroke-width:1.5px;
    classDef stone fill:#626A6D,stroke:#1A1917,color:#F7F5F0,stroke-width:1.5px;
    classDef ivory fill:#F7F5F0,stroke:#8C7963,color:#1A1917,stroke-width:1.5px;

    class Browser ivory;
    class Proxy,Auth slate;
    class Public,Dash sand;
    class Actions,UploadAPI,CvAPI,SearchAPI stone;
    class DB charcoal;
```

- **Two-Layer Access Control**: `src/proxy.js` runs an optimistic JWT check on `/dashboard/:path*` and redirects unauthenticated requests to `/login`. Authoritative checks run in `requireAuth()` and `requireRole()` (`src/lib/auth.js`), joining `sessions` and `users` to verify expiration, `is_active = TRUE`, `role`, and `curator_status = 'approved'`.
- **Dual File Storage**: Public artwork images uploaded through `POST /api/upload` are verified/resized by `sharp` and written to `public/uploads/`. Sensitive curator CVs (`.pdf`, `.doc`, `.docx` verified via magic bytes in `src/lib/curator-cv.js`) are stored outside `public/` in `storage/curator-cvs/` and served only through the authorized `/api/curator-applications/[id]/cv` handler.

<details>
<summary><strong>Interactive Diagram: PostgreSQL Database Schema (11 Tables)</strong></summary>

<br />

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : owns
    USERS ||--o{ ARTWORKS : publishes
    USERS ||--o{ CHALLENGES : curates
    USERS ||--o{ SUBMISSIONS : submits
    USERS ||--o{ COMMENTS : authors
    USERS ||--o{ FAVORITES : saves
    USERS ||--o{ ARTWORK_LIKES : likes
    USERS ||--o{ REPORTS : files
    USERS ||--o{ CURATOR_APPLICATIONS : submits

    CATEGORIES ||--o{ ARTWORKS : categorizes
    ARTWORKS ||--o{ ARTWORK_LIKES : receives
    ARTWORKS ||--o{ FAVORITES : saved_in
    ARTWORKS ||--o{ COMMENTS : has
    ARTWORKS ||--o{ REPORTS : reported_in
    ARTWORKS ||--o{ SUBMISSIONS : entered_as
    CHALLENGES ||--o{ SUBMISSIONS : receives

    USERS {
        int id PK
        varchar name
        varchar email UK
        text password
        varchar role
        varchar curator_status
        boolean is_active
    }
    CURATOR_APPLICATIONS {
        int id PK
        int user_id FK
        int attempt_number
        text portfolio_url
        text cv_file_path
        varchar status
        text rejection_reason
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
        text winner_note
    }
```

</details>

---

## Getting Started

### 1. Prerequisites

- **Node.js** `20+`
- **npm** (included with Node.js)
- **PostgreSQL** `14+`

### 2. Clone Repository

```bash
git clone https://github.com/aalfm/arthive-art-showcase.git
```

### 3. Navigate to Project

```bash
cd arthive-art-showcase
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

Copy the template file to `.env.local` and configure your PostgreSQL connection and session secret:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/arthive_db
SESSION_SECRET=replace-with-a-random-32-char-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** `src/lib/auth.js` and `src/proxy.js` fall back to a default development string if `SESSION_SECRET` is omitted, so always set a strong 32+ character secret in `.env.local` and production environments.

### 6. Database Setup

Create the database, initialize the schema, and execute the idempotent seed script in order:

```bash
psql -U postgres -c "CREATE DATABASE arthive_db;"
psql -U postgres -d arthive_db -f database/schema.sql
psql -U postgres -d arthive_db -f database/seed.sql
```

> **Important:** Always run `database/schema.sql` before `database/seed.sql`. The seed script creates tables/relations assumptions and ends with verification counts for users, categories, artworks, likes, and challenges.

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

<details>
<summary><strong>Environment Variables Reference (`.env.example`)</strong></summary>

<br />

| Variable | Description | Required | Example Value |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by `pg` Pool in `src/lib/db.js`. | Yes | `postgresql://postgres:your_password@localhost:5432/arthive_db` |
| `SESSION_SECRET` | Secret key (32+ characters recommended) used to sign HS256 JWT session cookies. | Yes (Production) | `replace-with-a-random-32-char-secret` |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the application configured in `.env.example`. | No | `http://localhost:3000` |

</details>

<details>
<summary><strong>Database Demo Accounts & Verification Queries (`database/seed.sql`)</strong></summary>

<br />

| Role | Email | Password | Status |
|---|---|---|---|
| **Admin** | `admin@arthive.com` | `Admin@123` | Active |
| **Curator** | `kurator@arthive.com` | `Curator@123` | Approved |
| **Member** | `member@arthive.com` | `Member@123` | Active |

Verify database tables manually at any time:
```sql
\dt
SELECT role, COUNT(*) FROM users GROUP BY role;
```

</details>

<details>
<summary><strong>Troubleshooting Common Setup Issues</strong></summary>

<br />

- **`[DB] Query error` or connection refused**: Confirm PostgreSQL is running and verify host, port, username, password, and `arthive_db` in `.env.local`.
- **Redirected back to `/login` after signing in**: Verify `database/schema.sql` was executed (creating `sessions`) and `SESSION_SECRET` matches across requests.
- **`sharp` installation or runtime failure**: Rebuild native bindings on Node.js `20+` using `npm rebuild sharp`.
- **Port `3000` conflict**: Stop the conflicting process or start Next.js on a custom port (`npx next dev -p 3001`).
- **Seed errors**: Drop and re-initialize `arthive_db`, then run `database/schema.sql` strictly before `database/seed.sql`.

</details>

---

## Project Structure

```text
arthive-art-showcase/
├── database/
│   ├── schema.sql                       # 11-table PostgreSQL schema, constraints, indexes
│   └── seed.sql                         # Idempotent demo accounts, categories, artworks, challenges
├── public/
│   ├── logo/                            # Official ARCHIVE / ARTHIVE SVG logos & favicons
│   └── uploads/                         # Local directory for sharp-processed artwork images
├── src/
│   ├── app/
│   │   ├── (public)/                    # Public routes: explore, artworks/[id], artists, challenges, auth
│   │   ├── api/
│   │   │   ├── artworks/search/         # Placeholder search route
│   │   │   ├── challenges/search/       # Live challenge search & status counts API
│   │   │   ├── curator-applications/    # Authorized CV file retrieval endpoint ([id]/cv)
│   │   │   └── upload/                  # Authenticated image upload & sharp sanitization API
│   │   ├── dashboard/
│   │   │   ├── admin/                   # Overview, users, curators, artworks, challenges, categories, reports
│   │   │   ├── curator/                 # Overview, pending/reapply gate, challenges CRUD, judging
│   │   │   ├── member/                  # Overview, artworks CRUD, favorites, submissions, profile, settings
│   │   │   ├── layout.js                # Shared dashboard sidebar layout
│   │   │   └── page.js                  # Role-based dashboard redirector
│   │   ├── globals.css                  # Editorial design tokens (ivory, charcoal, sand) & styles
│   │   ├── layout.js                    # Root layout loading Manrope font & favicon
│   │   └── page.js                      # Public homepage exhibition
│   ├── components/
│   │   ├── artists/                     # Artist directory, navigation, and portfolio components
│   │   ├── dashboard/                   # Account inactive notice & admin artwork preview
│   │   ├── home/                        # HeroSection, ArtworkGallery, ChallengesSection, ArtistsSection
│   │   ├── layout/                      # Navbar, Footer, DashboardSidebar, PublicPageContainer
│   │   └── ui/                          # DepthCarousel, Folder, ImageUpload, Breadcrumb, Modal, Toast, Icons
│   ├── lib/
│   │   ├── actions/                     # Server Actions (admin, artwork, auth, challenge, curator)
│   │   ├── auth.js                      # JWT + DB session management, requireAuth, requireRole
│   │   ├── avatar.js                    # Role-aware avatar resolution helpers
│   │   ├── curator.js                   # Curator validation rules & rejection reason guidelines
│   │   ├── curator-cv.js                # Private CV magic-byte validation & storage/curator-cvs/ I/O
│   │   ├── db.js                        # PostgreSQL connection pool and query helper
│   │   ├── member-navigation.js         # Contextual member navigation helpers
│   │   ├── navigation.js                # Active page label & dashboard navigation helpers
│   │   └── utils.js                     # Positive integer ID & formatting helpers
│   └── proxy.js                         # Optimistic session cookie guard for /dashboard/*
├── .env.example                         # Environment variable template
├── eslint.config.mjs                    # ESLint configuration
├── jsconfig.json                        # Path aliases (@/* -> ./src/*)
├── next.config.mjs                      # Next.js config (remote images, 10MB action body limit)
└── package.json                         # Dependencies and npm scripts
```

<details>
<summary><strong>Runtime Storage Note (`storage/curator-cvs/`)</strong></summary>

<br />

When a curator uploads a CV file (`.pdf`, `.doc`, or `.docx`), `src/lib/curator-cv.js` creates `storage/curator-cvs/` at the project root so private applicant documents remain outside `public/` and are never served statically.

</details>

---

## Usage

| Role | Entry Point | Core Workflow |
|---|---|---|
| **Public / Guest** | `/` · `/explore` · `/artists` · `/challenges` | Browse the 3D hero exhibition, search/filter works by architectural category, inspect artist portfolios, and view challenge rules and ranked winners. |
| **Member** | `/register` · `/dashboard/member` | Sign in to upload artworks (file upload or URL), manage favorites, comment and like works, report violations, submit active artworks to challenges, and update profile settings. |
| **Curator** | `/register` · `/dashboard/curator` | Apply with a portfolio URL and CV; once approved by an Admin, create/edit challenges, review participant entries, and select 1st–3rd place winners with notes after the deadline. |
| **Administrator** | `/login` · `/dashboard/admin` | Inspect platform metrics, verify curator applications and private CVs, activate/deactivate non-admin users, manage categories, monitor challenges, and resolve artwork reports. |

<details>
<summary><strong>Available npm Scripts (`package.json`)</strong></summary>

<br />

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts the Next.js development server at `http://localhost:3000`. |
| `build` | `npm run build` | Builds the application for production. |
| `start` | `npm run start` | Runs the compiled production server. |
| `lint` | `npm run lint` | Runs ESLint with `eslint-config-next` Core Web Vitals rules. |

</details>

<details>
<summary><strong>Security & Access Control Summary</strong></summary>

<br />

- **Session & Cookie Protection**: DB-backed `sessions` paired with `httpOnly`, `sameSite: 'lax'` HS256 JWT cookies (`secure: true` in production); user deactivation deletes active sessions immediately.
- **Password Security**: `bcryptjs` hashing with a salt factor of `12` (`src/lib/actions/auth.actions.js`).
- **SQL Injection Defense**: All database queries use parameterized `$1, $2, ...` placeholders.
- **Upload & Document Validation**: Artwork images pass through `sharp` format verification and resizing; curator CVs undergo magic-byte validation (`%PDF-`, OLE2 `.doc`, ZIP `.docx`) and role-restricted streaming.

</details>

---

## Contributing

Contributions, bug reports, and architectural improvements are welcome.

1. **Fork the repository** on GitHub.
2. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** and verify code quality before committing:
   ```bash
   npm run lint
   npm run build
   ```
4. **Commit using Conventional Commits**:
   - `feat: add artwork tag filtering on explore page`
   - `fix: resolve curator reapplication CV retention edge case`
   - `refactor: simplify challenge winner validation helper`
   - `docs: update README architecture diagram`
5. **Submit a Pull Request** detailing your changes and verification steps.

---

## License

No `LICENSE` file is currently specified in this repository. All rights remain with the repository author unless a license is added.

---

## Author

**aalfm** — [GitHub Profile](https://github.com/aalfm) · [ARTHIVE Repository](https://github.com/aalfm/arthive-art-showcase)

<sub>Built with Next.js, React, PostgreSQL, Tailwind CSS, GSAP, jose, bcryptjs, and sharp.</sub>
