<div align="center">

<img src="docs/assets/Archive_Gallery_identity · 6s.gif" alt="ARCHIVE — Digital Architecture Showcase Platform" width="100%" />

<br /><br />

<img src="public/logo/Favicon_archive.svg" alt="ARCHIVE Logo" width="44" height="44" />

### Welcome to ARCHIVE

**A digital showcase platform dedicated to architectural creativity, spatial visualization, and curated design competitions.**<br />
<sub>Built to elevate architectural studies, photography, and critical design discourse beyond ordinary social feeds.</sub>

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-0A0A0A?style=for-the-badge&logo=greensock&logoColor=88CE02)](https://gsap.com/)

<br />

[About ARCHIVE](#about-archive) · [Key Features](#key-features) · [Preview](#screenshots--preview) · [Tech Stack](#technology-stack) · [Project Structure](#project-structure) · [Database](#database) · [Setup](#installation--setup) · [Roles & Permissions](#user-roles--permissions) · [Contributing](#contributing--license)

</div>

---

<a id="about-archive"></a>

## 🏛️ About ARCHIVE

**ARCHIVE** is a digital architecture showcase platform created for architects, spatial visualizers, architectural photographers, curators, and design enthusiasts.

General-purpose image feeds rarely offer the editorial structure needed to appreciate tectonic clarity, materiality, and spatial atmosphere. **ARCHIVE** organizes works around architectural typologies—including *Modern Architecture*, *Sustainable Architecture*, *Tropical Architecture*, *Residential Architecture*, *Interior Architecture*, *Urban Design*, *Landscape Architecture*, and *Parametric Architecture*—while separating creative publishing, curatorial competitions, and platform governance into dedicated role workspaces.

- **For Visitors & Enthusiasts**: Explore curated works through interactive 3D showcases, category-filtered galleries, creator dossiers, and public competition archives.
- **For Creators (Members)**: Publish architectural works, bookmark favorites, engage in critique comments, and enter themed challenges.
- **For Curators**: Complete portfolio and CV verification, author unique time-bound architectural challenges, review member entries, and recognize ranked winners.
- **For Administrators**: Uphold platform integrity through multi-attempt curator verification, user account governance, category management, and content moderation.

```mermaid
flowchart LR
    V["🏛️ Public Visitor\nExplore Exhibition"] -->|"Register"| M["🎨 Member / Creator\nPublish & Compete"]
    V -->|"Apply with Portfolio & CV"| CP["⏳ Curator Applicant\nPending Review"]
    CP -->|"Approved"| CA["🏆 Verified Curator\nHost & Judge Challenges"]
    CP -->|"Rejected with Reason"| CR["🔄 Reapply\nUpdate CV & Portfolio"]
    CR --> CP
    AD["🛡️ Administrator\nVerify & Moderate"] -->|"Review CVs & Portfolios"| CP
    AD -->|"Moderate Reports & Users"| M

    classDef navy fill:#0D1730,stroke:#5C7FA8,color:#F7F5F0,stroke-width:1.5px;
    classDef slate fill:#1E293B,stroke:#B5A284,color:#EAE7E0,stroke-width:1.5px;
    classDef sand fill:#B5A284,stroke:#0D1730,color:#0D1730,stroke-width:1.5px;
    classDef blue fill:#3B5998,stroke:#EAE7E0,color:#F7F5F0,stroke-width:1.5px;
    classDef charcoal fill:#1A1917,stroke:#8C7963,color:#F7F5F0,stroke-width:1.5px;

    class V navy;
    class M sand;
    class CP,CR slate;
    class CA blue;
    class AD charcoal;
```

---

<a id="key-features"></a>

## ✨ Key Features

### 🏛️ Public User / Guest
- **Curated Homepage (`/`)**: Interactive 3D drag-and-tilt featured works stage (`HeroSection`), category-filterable flip-plate exhibition (`ArtworkGallery`), GSAP-powered `DepthCarousel` for active challenges (`ChallengesSection`), and interactive `Folder` creator dossiers (`ArtistsSection`).
- **Explore Gallery (`/explore`)**: Search artworks by title or creator name, filter across architectural categories, and sort by latest or most liked.
- **Artwork Detail (`/artworks/[id]`)**: Full artwork view with tags, category badge, like count, community comments, and related works by the same creator.
- **Artist Directory (`/artists`, `/artists/[id]`)**: Searchable directory of creators with architectural specialization filters, bio, and external portfolio links.
- **Architecture Challenges (`/challenges`, `/challenges/[id]`)**: Live search and status tabs (`All`, `Active`, `Upcoming`, `Completed`) powered by `GET /api/challenges/search`, displaying rules, prizes, submission counts, and 1st–3rd place winners.
- **Focused Auth Layout (`/login`, `/register`)**: Minimalist logo-only Navbar, navigation-free Footer, and accessible Show/Hide password toggles (`PasswordInput`).

### 🎨 Member / Creator
- **Creator Workspace (`/dashboard/member`)**: Overview of published works, moderation notices, favorites, and challenge entries.
- **Artwork Management (`/dashboard/member/artworks`)**: Create, edit, and delete artworks with device image uploads processed and normalized via `sharp` (`POST /api/upload`: `JPG`, `JPEG`, `PNG`, `WebP` up to `10 MB`).
- **Community & Favorites (`/dashboard/member/favorites`)**: Like artworks, save favorites, post or delete personal comments, and file moderation reports (`SARA`, `Plagiarism`, `Inappropriate Content`, `Other`).
- **Challenge Submissions (`/dashboard/member/submissions`)**: Submit active artworks to ongoing challenges (one entry per member per challenge) and withdraw entries before the deadline.
- **Profile & Security (`/dashboard/member/profile`, `/dashboard/member/settings`)**: Update display name, uploaded profile photo, bio, portfolio link, and account password.

### 🏆 Curator
- **Credentialed Onboarding (`/dashboard/curator/pending`)**: Register with a mandatory portfolio URL and CV document (`.pdf`, `.doc`, `.docx` up to `5 MB` stored privately in `storage/curator-cvs/` or external CV link). Rejected applicants can view documented reasons and submit a reapplication.
- **Curator Workspace (`/dashboard/curator`)**: Overview of owned challenges, active schedules, and submissions awaiting evaluation.
- **Challenge Authoring (`/dashboard/curator/challenges`)**: Create, edit, and delete owned challenges with live case-insensitive duplicate title prevention (`GET /api/challenges/check-name` + PostgreSQL unique index), uploaded banner images, rules, prizes, and start/end dates.
- **Judging & Winner Podium (`/dashboard/curator/challenges/[id]/submissions`)**: Evaluate participant entries and assign or clear 1st–3rd place winners with optional jury notes after the challenge ends.

### 🛡️ Administrator
- **Admin Overview (`/dashboard/admin`)**: Real-time counts of users, active artworks, pending reports, and pending curator verifications with direct action queues.
- **Curator Verification (`/dashboard/admin/curators`, `[id]`)**: Inspect portfolio links, view or download private CV documents (`GET /api/curator-applications/[id]/cv`), review multi-attempt history, and approve or reject applications with mandatory rejection notes.
- **User Management (`/dashboard/admin/users`, `[id]`)**: Search users, filter by role, and activate or deactivate non-admin accounts (immediately revoking active database sessions).
- **Content & Category Governance (`/dashboard/admin/reports`, `artworks`, `challenges`, `categories`)**: Manage architectural categories, dismiss reports or take down offending artworks, and inspect challenges and curator-selected winners in read-only mode.

---

<a id="screenshots--preview"></a>

## 🖼️ Screenshots / Preview

<table>
<tr>
<td align="center" width="50%">
<img src="docs/screenshots/home.png" alt="ARCHIVE Landing Page" width="100%" /><br />
<strong>🏛️ Landing Page &amp; Featured Works</strong><br />
<sub>Interactive 3D showcase, curated artwork gallery, challenges, and artist dossiers.</sub>
</td>
<td align="center" width="50%">
<img src="docs/screenshots/explore.png" alt="ARCHIVE Explore Gallery" width="100%" /><br />
<strong>🔍 Explore Artworks</strong><br />
<sub>Search by title or creator, filter by architectural category, and sort by popularity.</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<img src="docs/screenshots/challenges.png" alt="ARCHIVE Architecture Challenges" width="100%" /><br />
<strong>🏆 Architecture Challenges</strong><br />
<sub>Live status filtering (Active, Upcoming, Completed), schedules, prizes, and entries.</sub>
</td>
<td align="center" width="50%">
<img src="docs/screenshots/dashboards.png" alt="ARCHIVE Admin Dashboard" width="100%" /><br />
<strong>🛡️ Role-Based Dashboards</strong><br />
<sub>Dedicated workspaces for Administrators, Verified Curators, and Members.</sub>
</td>
</tr>
</table>

---

<a id="technology-stack"></a>

## ⚙️ Technology Stack

**Frontend**

[![Next.js](https://img.shields.io/badge/Next.js_16.4.6-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19.3.0-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![GSAP](https://img.shields.io/badge/GSAP_3.13.0-88CE02?style=flat-square&logo=greensock&logoColor=111111)](https://gsap.com/)

**Backend & Media**

[![Node.js](https://img.shields.io/badge/Node.js_20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![sharp](https://img.shields.io/badge/sharp_0.35.5-99CC00?style=flat-square&logo=sharp&logoColor=111111)](https://sharp.pixelplumbing.com/)
[![uuid](https://img.shields.io/badge/uuid_14.0.3-6366F1?style=flat-square)](https://github.com/uuidjs/uuid)

**Database**

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_14+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![node-postgres](https://img.shields.io/badge/pg_8.23.1-336791?style=flat-square&logo=postgresql&logoColor=white)](https://node-postgres.com/)

**Authentication**

[![jose](https://img.shields.io/badge/jose_6.2.18_(JWT)-000000?style=flat-square&logo=jsonwebtokens&logoColor=FB015B)](https://github.com/panva/jose)
[![bcryptjs](https://img.shields.io/badge/bcryptjs_3.0.3-D97706?style=flat-square)](https://github.com/dcodeIO/bcrypt.js)

**UI / Styling**

[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4.3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Manrope](https://img.shields.io/badge/Font_Manrope-4285F4?style=flat-square&logo=googlefonts&logoColor=white)](https://fonts.google.com/specimen/Manrope)

**Development Tools**

[![ESLint](https://img.shields.io/badge/ESLint_9-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org/)
[![npm](https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white)](https://www.npmjs.com/)

**Design Tools**

![Figma](https://img.shields.io/badge/Figma-Design%20Tool-F24E1E?style=flat-square&logo=figma&logoColor=white)

<details>
<summary><strong>Explore System Architecture Flow (Mermaid)</strong></summary>

<br />

```mermaid
flowchart TD
    Client["🌐 Browser Client"]
    Proxy["🛡️ src/proxy.js\nOptimistic JWT Check (/dashboard/*)"]
    Public["🏛️ Public Pages\n/, /explore, /artworks, /artists, /challenges"]
    Dash["📊 Protected Dashboards\n/dashboard/member, /curator, /admin"]
    Auth["🔐 src/lib/auth.js\ngetSession, requireAuth, requireRole"]
    Actions["⚙️ Server Actions\nsrc/lib/actions/*.js"]
    Upload["🖼️ POST /api/upload\nsharp -> public/uploads/"]
    CV["📄 GET /api/curator-applications/[id]/cv\nPrivate -> storage/curator-cvs/"]
    Check["✅ GET /api/challenges/check-name"]
    Search["🔍 GET /api/challenges/search"]
    DB[("🗄️ PostgreSQL\nsrc/lib/db.js Pool")]

    Client --> Proxy
    Client --> Public
    Proxy --> Dash
    Public --> DB
    Dash --> Auth
    Auth --> DB
    Dash --> Actions
    Public --> Actions
    Actions --> Auth
    Actions --> DB
    Client --> Upload
    Client --> CV
    Client --> Check
    Client --> Search
    Upload --> Auth
    CV --> Auth
    Check --> Auth
    Check --> DB
    Search --> DB

    classDef navy fill:#0D1730,stroke:#5C7FA8,color:#F7F5F0,stroke-width:1.5px;
    classDef slate fill:#1E293B,stroke:#B5A284,color:#EAE7E0,stroke-width:1.5px;
    classDef sand fill:#B5A284,stroke:#0D1730,color:#0D1730,stroke-width:1.5px;
    classDef blue fill:#3B5998,stroke:#EAE7E0,color:#F7F5F0,stroke-width:1.5px;
    classDef charcoal fill:#1A1917,stroke:#8C7963,color:#F7F5F0,stroke-width:1.5px;

    class Client navy;
    class Proxy,Auth slate;
    class Public,Dash sand;
    class Actions,Upload,CV,Check,Search blue;
    class DB charcoal;
```

</details>

---

<a id="project-structure"></a>

## 📂 Project Structure

```text
arthive-art-showcase/
├── docs/
│   ├── assets/
│   │   └── Archive_Gallery_identity · 6s.gif  # Animated landscape brand header (1600x400)
│   └── screenshots/                           # Live application screenshots for README
│       ├── challenges.png
│       ├── dashboards.png
│       ├── explore.png
│       └── home.png
├── public/
│   ├── logo/                                  # Official ARCHIVE SVGs (Logo_archive_white.svg, favicons)
│   └── uploads/                               # Local storage for sharp-processed artwork & banner uploads
├── scripts/
│   ├── db-reset.mjs                           # Protected local dev/test DB reset & deterministic reseed
│   ├── db-seed.mjs                            # Idempotent schema + official seed runner
│   └── db-utils.mjs                           # Environment safety guards & table count audit helpers
├── src/
│   ├── app/
│   │   ├── (public)/                          # Public & auth routes: explore, artworks/[id], artists, challenges, login, register
│   │   ├── api/
│   │   │   ├── artworks/search/               # Reserved search route placeholder (explore filters run server-side)
│   │   │   ├── challenges/
│   │   │   │   ├── check-name/                # Case-insensitive unique challenge title check API
│   │   │   │   └── search/                    # Live challenge search & status filter API
│   │   │   ├── curator-applications/[id]/cv/  # Authenticated private CV streaming & download API
│   │   │   └── upload/                        # Authenticated sharp image validation & upload API
│   │   ├── dashboard/                         # Role-based workspaces: admin/, curator/, member/
│   │   ├── error.js                           # Global error boundary
│   │   ├── globals.css                        # Editorial design tokens, responsive layout & auth styles
│   │   ├── layout.js                          # Root layout loading Manrope font & favicon
│   │   ├── not-found.js                       # Custom 404 page
│   │   └── page.js                            # Homepage exhibition
│   ├── components/
│   │   ├── artists/                           # Artist directory, navigation & portfolio components
│   │   ├── dashboard/                         # AccountInactiveNotice, AdminArtworkPreview, ChallengeTitleField
│   │   ├── home/                              # HeroSection, ArtworkGallery, ChallengesSection, ArtistsSection
│   │   ├── layout/                            # Navbar, Footer, DashboardSidebar, PublicPageContainer
│   │   └── ui/                                # DepthCarousel, Folder, ImageUpload, PasswordInput, Modal, Toast, Icons
│   ├── database/
│   │   ├── schema.sql                         # 11-table PostgreSQL schema, constraints & unique indexes
│   │   └── seed.sql                           # Idempotent realistic seed dataset (users, works, challenges, CVs)
│   ├── lib/
│   │   ├── actions/                           # Server Actions (admin, artwork, auth, challenge, curator)
│   │   ├── auth.js                            # JWT & DB session helpers, requireAuth, requireRole
│   │   ├── avatar.js                          # Member profile image policy helpers
│   │   ├── challenge-auth.js                  # Approved-curator & challenge-ownership RBAC guards
│   │   ├── challenge-validation.js            # Case-insensitive challenge title normalization & duplicate check
│   │   ├── curator-cv.js                      # Magic-byte CV validation & private storage/curator-cvs/ I/O
│   │   ├── curator.js                         # Portfolio URL, CV URL/file & rejection reason validators
│   │   ├── db.js                              # PostgreSQL connection pool and parameterized query helper
│   │   ├── member-navigation.js               # Navbar dashboard-origin active state resolver
│   │   ├── navigation.js                      # Route labels & auth-variant layout detector (isAuthPagePath)
│   │   └── utils.js                           # Formatting, ID parsing & upload path helpers
│   └── proxy.js                               # Optimistic JWT route guard for /dashboard/*
├── storage/
│   └── curator-cvs/                           # Private CV storage (seeded PDFs tracked; user uploads gitignored)
│       ├── seed-cv-adrian.pdf
│       ├── seed-cv-clara.pdf
│       ├── seed-cv-kurator.pdf
│       └── seed-cv-pending.pdf
├── .env.example                               # Environment variable template
├── eslint.config.mjs                          # ESLint 9 configuration (eslint-config-next)
├── jsconfig.json                              # Path alias configuration (@/* -> ./src/*)
├── next.config.mjs                            # Next.js configuration (remote images, 10MB action body limit)
└── package.json                               # Project dependencies and npm scripts
```

---

<a id="database"></a>

## 🗄️ Database

ARCHIVE uses **PostgreSQL 14+** via the `pg` connection pool in `src/lib/db.js`.

- **`src/database/schema.sql`**: Defines all **11 tables**, foreign key cascades, check constraints, and indexes (including `idx_challenges_unique_title` on `LOWER(BTRIM(title))` and `idx_curator_applications_one_pending`).
- **`src/database/seed.sql`**: Idempotent seed dataset containing **11 realistic users**, **10 architectural categories**, **19 artworks** (18 active + 1 `taken_down` moderation demo), **6 challenges** (2 active, 2 upcoming, 2 completed), **13 submissions** (including 1st–3rd place winners on completed challenges), **4 curator applications** with non-null portfolio URLs and seed CV PDFs in `storage/curator-cvs/`, **8 favorites**, **8 comments**, **4 moderation reports**, and synchronized `artwork_likes`.

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : owns
    USERS ||--o{ ARTWORKS : publishes
    USERS ||--o{ CHALLENGES : curates
    USERS ||--o{ SUBMISSIONS : submits
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ FAVORITES : saves
    USERS ||--o{ ARTWORK_LIKES : likes
    USERS ||--o{ REPORTS : files
    USERS ||--o{ CURATOR_APPLICATIONS : submits

    CATEGORIES ||--o{ ARTWORKS : classifies
    ARTWORKS ||--o{ ARTWORK_LIKES : receives
    ARTWORKS ||--o{ FAVORITES : saved_in
    ARTWORKS ||--o{ COMMENTS : has
    ARTWORKS ||--o{ REPORTS : subject_of
    ARTWORKS ||--o{ SUBMISSIONS : entered_as
    CHALLENGES ||--o{ SUBMISSIONS : receives
```

<details>
<summary><strong>Database Tables &amp; Seeded Demo Accounts Reference</strong></summary>

<br />

| Table | Purpose |
|---|---|
| `users` | Accounts for `admin`, `curator` (`pending`, `approved`, `rejected`), and `member` with `is_active` governance. |
| `sessions` | Server-backed session records paired with `archive_session` HS256 JWT cookies. |
| `categories` | Architectural categories (unique names, `ON DELETE RESTRICT` on artworks). |
| `artworks` | Published and `taken_down` architectural works with image URL, tags, and cached `like_count`. |
| `artwork_likes` | Unique `(user_id, artwork_id)` like records. |
| `favorites` | Unique `(user_id, artwork_id)` saved bookmarks. |
| `comments` | User critique comments on artworks. |
| `reports` | Artwork moderation reports (`SARA`, `Plagiarism`, `Inappropriate Content`, `Other`) with status & `admin_note`. |
| `challenges` | Curator-owned competitions with globally unique case-insensitive titles, schedules, rules, and prizes. |
| `submissions` | One artwork entry per member per challenge, with optional `winner_rank` (`1`–`3`) and `winner_note`. |
| `curator_applications` | Multi-attempt curator applications storing `portfolio_url`, `cv_file_path`, `cv_file_name`, `cv_url`, and review decisions. |

**Primary Seeded Demo Accounts (`src/database/seed.sql`)**

| Role | Name | Email | Password | Status |
|---|---|---|---|---|
| **Admin** | Daniel Hartono | `admin@archive.com` | `Admin@123` | Active |
| **Curator** | Henrik Lindstrom | `kurator@archive.com` | `Curator@123` | Approved |
| **Curator** | Adrian Mahendra | `adrian@archive.com` | `Curator@123` | Approved |
| **Curator** | Lucas Vermeer | `pending@archive.com` | `Curator@123` | Pending |
| **Curator** | Clara Wijaya | `clara@archive.com` | `Curator@123` | Rejected |
| **Member** | Alya Ramadhani | `member@archive.com` | `Member@123` | Active |

*Additional seeded member accounts (`raka@archive.com`, `nadia@archive.com`, `dimas@archive.com`, `kevin@archive.com`, and inactive `sofia@archive.com`) also use `Member@123`.*

</details>

---

<a id="installation--setup"></a>

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** `20+`
- **npm** (bundled with Node.js)
- **PostgreSQL** `14+`

### Step-by-Step Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/aalfm/archive-art-showcase.git
   cd archive-art-showcase
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Copy `.env.example` to `.env.local` and configure your PostgreSQL connection and session secret:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/archive_db
   SESSION_SECRET=replace-with-a-random-32-char-secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   > **Security Note:** Never commit `.env.local`. If `SESSION_SECRET` is omitted, `src/lib/auth.js` and `src/proxy.js` use a built-in development fallback key—always set a strong secret in production.

4. **Create Database, Apply Schema & Run Seed**

   ```bash
   psql -U postgres -c "CREATE DATABASE archive_db;"
   npm run db:seed
   ```

   Or execute the SQL files manually in order:

   ```bash
   psql -U postgres -d archive_db -f src/database/schema.sql
   psql -U postgres -d archive_db -f src/database/seed.sql
   ```

   To wipe local development/test data and restore a clean seed-only state:

   ```bash
   npm run db:reset
   ```

   > **Safety Guard:** `npm run db:reset` truncates tables (`RESTART IDENTITY CASCADE`) and re-runs `src/database/schema.sql` + `src/database/seed.sql`. `scripts/db-utils.mjs` blocks execution on non-local hosts, production `NODE_ENV`, or production-named databases.

5. **Start the Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

<details>
<summary><strong>Available npm Scripts &amp; Troubleshooting</strong></summary>

<br />

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts the Next.js development server at `http://localhost:3000`. |
| `build` | `npm run build` | Builds the production Next.js bundle. |
| `start` | `npm run start` | Serves the compiled production build. |
| `lint` | `npm run lint` | Runs ESLint (`eslint-config-next/core-web-vitals`). |
| `db:seed` | `npm run db:seed` | Applies `src/database/schema.sql` (if tables are missing) and runs `src/database/seed.sql` idempotently. |
| `db:reset` | `npm run db:reset` | Resets local dev/test tables and restores clean seed-only data. |

**Common Troubleshooting**
- **`[DB] Query error` / connection refused**: Verify PostgreSQL is running and `DATABASE_URL` in `.env.local` is valid.
- **Redirected back to `/login` after signing in**: Ensure `src/database/schema.sql` has been applied (`sessions` table exists) and `SESSION_SECRET` is configured.
- **`sharp` install or runtime error**: Run `npm rebuild sharp` with Node.js `20+`.

</details>

---

<a id="user-roles--permissions"></a>

## 🔐 User Roles & Permissions

Route protection combines optimistic JWT cookie verification in `src/proxy.js` (`/dashboard/:path*`) with authoritative database session, `is_active`, `role`, and `curator_status` checks in `src/lib/auth.js` (`requireRole`) and `src/lib/challenge-auth.js`.

| Capability | Public / Guest | Member | Curator (Pending / Rejected) | Curator (Approved) | Administrator |
|---|---|---|---|---|---|
| Browse gallery, artists, and challenges | Yes | Yes | Yes | Yes | Redirected to Admin Dashboard |
| Like, favorite, comment on, or report artworks | No | Yes | No | No | No |
| Upload, edit, and delete own artworks | No | Yes | No | No | Edit / Delete / Take down any |
| Submit and withdraw challenge entries | No | Yes | No | No | No |
| Update personal profile & password | No | Profile + Password | No* | No* | No* |
| Reapply for curator verification (CV + portfolio) | No | No | Rejected only | No | No |
| Create, edit, and delete own challenges | No | No | No | Yes | Read-only oversight (403 on write) |
| Assign or clear challenge winners (1st–3rd) | No | No | No | Own ended challenges | Read-only oversight (403 on write) |
| Verify curator applications & stream private CVs | No | No | No | No | Yes |
| Activate or deactivate non-admin accounts | No | No | No | No | Yes |
| Manage categories & resolve artwork reports | No | No | No | No | Yes |

*\*Personal profile editing (`/dashboard/member/profile`) and password settings (`/dashboard/member/settings`) are scoped to active `member` accounts; `curator_status` transitions are strictly `pending -> approved` or `pending -> rejected -> (reapply) -> pending`.*

---

<a id="contributing--license"></a>

## 🤝 Contributing & License

### Contributing

1. Fork the repository and create a feature branch (`git checkout -b feat/your-feature`).
2. Verify code quality before opening a PR:
   ```bash
   npm run lint
   npm run build
   ```
3. Commit using Conventional Commits (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
4. Open a Pull Request describing your changes and verification results.

### License

No `LICENSE` file is currently included in this repository. All rights remain with the repository author unless a license is added.

---

<div align="center">

**ARCHIVE** — *A Space for Architectural Expression* · Built by [**aalfm**](https://github.com/aalfm)

</div>
