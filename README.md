<div align="center">

<img src="docs/assets/Archive_Gallery_identity · 6s.gif" alt="ARCHIVE — Where Architecture Meets Digital Expression." width="100%" />

<br /><br />

### Welcome to ARCHIVE

A digital showcase platform dedicated to architectural creativity and digital expression.<br />
<sub>Built to elevate spatial visualization, architectural photography, and curated design competitions beyond ordinary social feeds.</sub>

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-0A0A0A?style=for-the-badge&logo=greensock&logoColor=88CE02)](https://gsap.com/)

<br />

[About The Project](#about-the-project) · [Features](#features) · [Preview](#preview) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Usage](#usage) · [Contributing](#contributing) · [License](#license) · [Author](#author)

</div>

<a id="about-the-project"></a>

## 🏛️ About The Project

**ARCHIVE** is a digital architecture showcase platform created for architects, digital artists, curators, and spatial design enthusiasts.

General-purpose visual feeds rarely provide the structure required to appreciate architectural form, tectonic studies, and spatial storytelling. **ARCHIVE** addresses that gap by indexing artworks around architectural movements—including *Modern*, *Brutalist*, *Organic*, *Parametric*, and *Sustainable Architecture*—while separating publishing, curatorial challenges, and moderation into dedicated role workspaces.

- **For Visitors & Enthusiasts**: Discover curated exhibitions through a 3D depth carousel, category-filtered galleries, artist portfolios, and public competition archives.
- **For Creators (Members)**: Showcase architectural works, collect favorites, engage in critique threads, and enter themed challenges.
- **For Curators**: Undergo portfolio and CV verification, launch time-bound design challenges, review entries, and recognize ranked winners.
- **For Administrators**: Maintain platform quality through multi-attempt curator verification, account status governance, category management, and report moderation.

```mermaid
flowchart LR
    V["🏛️ Public Visitor\nExplore Exhibition"] -->|"Sign Up"| M["🎨 Member / Creator\nPublish & Compete"]
    V -->|"Apply with Portfolio & CV"| CP["⏳ Curator Applicant\nPending Review"]
    CP -->|"Approved"| CA["🏆 Verified Curator\nHost & Judge Challenges"]
    CP -->|"Rejected with Reason"| CR["🔄 Reapply\nUpdate CV & Portfolio"]
    CR --> CP
    AD["🛡️ Administrator\nVerify & Moderate"] -->|"Review"| CP
    AD -->|"Moderate Content & Users"| M

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

<a id="features"></a>

## ✨ Features

### 🏛️ Public / Guest
- **Interactive 3D Exhibition (`/`)**: GSAP-powered `DepthCarousel` hero, curated artwork showcase (up to 48 active works), active challenges, and featured artists.
- **Explore Gallery (`/explore`)**: Search works by title or creator name, filter by architectural category, and sort by latest or popularity.
- **Artwork Detail (`/artworks/[id]`)**: Full artwork view with tags, category attribution, like counter, community comments, and related works by the same creator.
- **Artist Discovery (`/artists`, `/artists/[id]`)**: Searchable directory of active members with architectural category filters and portfolio links.
- **Challenge Discovery (`/challenges`, `/challenges/[id]`)**: Live search and status tabs (`active`, `upcoming`) backed by `/api/challenges/search`, rules, prizes, and 1st–3rd place winners.

### 🎨 Member / Creator
- **Creator Overview (`/dashboard/member`)**: Summary metrics for published works, artworks under moderation review, challenge entries, and recent activity.
- **Artwork Management (`/dashboard/member/artworks`)**: Create, edit, and delete artworks via `sharp`-processed file uploads (`/api/upload`) or external image URLs.
- **Community & Favorites (`/dashboard/member/favorites`)**: Like artworks, bookmark favorites, post or delete personal comments, and submit moderation reports.
- **Challenge Submissions (`/dashboard/member/submissions`)**: Submit active artworks to ongoing competitions (one entry per challenge) and withdraw before the deadline.
- **Profile & Password (`/dashboard/member/profile`, `settings`)**: Manage display name, avatar, bio, portfolio link, and password.

### 🏆 Curator
- **Credentialed Onboarding (`/dashboard/curator/pending`)**: Register with a required portfolio URL and CV (`.pdf`, `.doc`, `.docx` up to 5 MB or external link); rejected applicants can review reasons and reapply.
- **Curator Workspace (`/dashboard/curator`)**: Overview of owned challenges, active competitions, and entries awaiting review.
- **Challenge Authoring (`/dashboard/curator/challenges`)**: Create, edit, and delete challenges with custom banners, rules, prizes, and schedules.
- **Judging & Winner Podium (`/dashboard/curator/challenges/[id]/submissions`)**: Evaluate submissions and assign or clear 1st–3rd place winners with optional jury notes after the end date.

### 🛡️ Administrator
- **Admin Overview (`/dashboard/admin`)**: Real-time platform statistics and a prioritized queue of pending moderation reports and curator applications.
- **Curator Verification (`/dashboard/admin/curators`, `[id]`)**: Inspect portfolio links, view or download private CV files securely, review attempt history, and approve or reject applications with mandatory rejection notes.
- **User Management (`/dashboard/admin/users`, `[id]`)**: Search accounts, filter by role, and activate or deactivate non-admin users (immediately revoking active sessions).
- **Content & Challenge Governance (`/dashboard/admin/reports`, `artworks`, `challenges`, `categories`)**: Manage architectural categories, inspect and judge platform challenges, and dismiss reports or take down offending artworks.

<details>
<summary><strong>View Detailed Role Permissions Matrix</strong></summary>

<br />

| Capability | Public / Guest | Member | Curator (Pending / Rejected) | Curator (Approved) | Administrator |
|---|---|---|---|---|---|
| Browse gallery, artists, and challenges | Yes | Yes | Yes | Yes | Yes |
| Like, favorite, comment on, or report artworks | No | Yes | Yes | Yes | Restricted* |
| Create, edit, and delete own artworks | No | Yes | No | No | Edit / Delete any |
| Submit and withdraw challenge entries | No | Yes | No | No | No |
| Update personal profile and password | No | Yes | Yes | Yes | Yes |
| Submit curator reapplication with CV & portfolio | No | No | Rejected only | No | No |
| Create, edit, and delete own challenges | No | No | No | Yes | Edit / Delete any |
| Assign or clear challenge winners (1st–3rd) | No | No | No | Own challenges | Any challenge |
| Verify curator applications & access private CVs | No | No | No | No | Yes |
| Activate or deactivate non-admin accounts | No | No | No | No | Yes |
| Manage categories & moderate reports | No | No | No | No | Yes |

*\*Administrators are blocked from liking, favoriting, commenting on, or reporting artworks to keep moderation neutral.*

</details>

<a id="preview"></a>

## 🖼️ Preview

> **Application Screenshots Pending:** No genuine UI screenshots exist in the repository yet (only brand SVGs in `public/logo/` and uploaded artwork media in `public/uploads/` are present). Add real captures to `docs/screenshots/` and update the gallery below when ready.

<table>
<tr>
<td align="center" width="50%">
<strong>🏛️ Landing Page &amp; 3D Hero</strong><br />
<sub><code>docs/screenshots/home.png</code> — Not yet added</sub><br />
<sub>GSAP 3D <code>DepthCarousel</code>, curated artwork gallery, and featured artists.</sub>
</td>
<td align="center" width="50%">
<strong>🔍 Explore &amp; Artwork Detail</strong><br />
<sub><code>docs/screenshots/explore.png</code> — Not yet added</sub><br />
<sub>Category filtering, sorting, artwork detail view, and critique threads.</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<strong>🏆 Challenges &amp; Winner Podium</strong><br />
<sub><code>docs/screenshots/challenges.png</code> — Not yet added</sub><br />
<sub>Live challenge discovery, competition briefs, and ranked winners.</sub>
</td>
<td align="center" width="50%">
<strong>📊 Role-Based Dashboards</strong><br />
<sub><code>docs/screenshots/dashboards.png</code> — Not yet added</sub><br />
<sub>Dedicated workspaces for Members, Curators, and Administrators.</sub>
</td>
</tr>
</table>

<a id="tech-stack"></a>

## ⚙️ Tech Stack

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

<details>
<summary><strong>Explore System Architecture &amp; Database Schema (Mermaid Diagrams)</strong></summary>

<br />

### Application Request & Auth Flow

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
    Client --> Search
    Upload --> Auth
    CV --> Auth
    Search --> DB
    Actions --> DB

    classDef navy fill:#0D1730,stroke:#5C7FA8,color:#F7F5F0,stroke-width:1.5px;
    classDef slate fill:#1E293B,stroke:#B5A284,color:#EAE7E0,stroke-width:1.5px;
    classDef sand fill:#B5A284,stroke:#0D1730,color:#0D1730,stroke-width:1.5px;
    classDef blue fill:#3B5998,stroke:#EAE7E0,color:#F7F5F0,stroke-width:1.5px;
    classDef charcoal fill:#1A1917,stroke:#8C7963,color:#F7F5F0,stroke-width:1.5px;

    class Client navy;
    class Proxy,Auth slate;
    class Public,Dash sand;
    class Actions,Upload,CV,Search blue;
    class DB charcoal;
```

### PostgreSQL Database Schema (11 Tables)

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

</details>

<a id="getting-started"></a>

## 🚀 Getting Started

### Prerequisites

- **Node.js** `20+`
- **npm** (bundled with Node.js)
- **PostgreSQL** `14+`

### Installation

1. **Clone Repository**

   ```bash
   git clone https://github.com/aalfm/arthive-art-showcase.git
   ```

2. **Navigate to Project**

   ```bash
   cd arthive-art-showcase
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Configure Environment Variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your PostgreSQL credentials and a strong random session secret:

   ```env
   DATABASE_URL=postgresql://postgres:PASSWORD_KAMU@localhost:5432/archive_db
   SESSION_SECRET=replace-with-a-random-32-char-secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   > **Important:** Always keep `.env.local` out of version control. If `SESSION_SECRET` is omitted, `src/lib/auth.js` and `src/proxy.js` fall back to a built-in development key—never rely on that fallback in production.

5. **Database Setup & Seeding**

   Create the PostgreSQL database (`archive_db`), then initialize the schema and official seed data:

   ```bash
   psql -U postgres -c "CREATE DATABASE archive_db;"
   npm run db:seed
   ```

   Or run the raw SQL files directly with `psql`:

   ```bash
   psql -U postgres -d archive_db -f database/schema.sql
   psql -U postgres -d archive_db -f database/seed.sql
   ```

   To wipe all local development/test data and restore a clean, deterministic seed-only state:

   ```bash
   npm run db:reset
   ```

   > **Safety Note:** `npm run db:seed` is idempotent and safe to re-run without duplicating records. `npm run db:reset` truncates all application tables (`RESTART IDENTITY CASCADE`) and re-applies `database/schema.sql` + `database/seed.sql`; it is strictly blocked on production or non-local databases.

6. **Run Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

<details>
<summary><strong>Environment Variables &amp; Demo Accounts Reference</strong></summary>

<br />

| Variable | Description | Required | Example |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by `src/lib/db.js`. | Yes | `postgresql://postgres:PASSWORD_KAMU@localhost:5432/archive_db` |
| `SESSION_SECRET` | Secret key (32+ chars recommended) for HS256 JWT cookies. | Yes (Prod) | `replace-with-a-random-32-char-secret` |
| `NEXT_PUBLIC_APP_URL` | Base application URL defined in `.env.example`. | No | `http://localhost:3000` |

**Seeded Demo Accounts (`database/seed.sql`)**

| Role | Email | Password | Status |
|---|---|---|---|
| **Admin** | `admin@arthive.com` | `Admin@123` | Active |
| **Curator** | `kurator@arthive.com` | `Curator@123` | Approved |
| **Member** | `member@arthive.com` | `Member@123` | Active |

</details>

<details>
<summary><strong>Available npm Scripts &amp; Troubleshooting</strong></summary>

<br />

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts the Next.js development server at `http://localhost:3000`. |
| `build` | `npm run build` | Builds the application for production. |
| `start` | `npm run start` | Runs the compiled production server. |
| `lint` | `npm run lint` | Runs ESLint with `eslint-config-next` rules. |
| `db:seed` | `npm run db:seed` | Initializes missing tables (`schema.sql`) and runs `database/seed.sql` idempotently. |
| `db:reset` | `npm run db:reset` | Resets local dev/test database tables (`RESTART IDENTITY CASCADE`), runs `schema.sql`, and restores seed-only data. |

**Common Troubleshooting**
- **`[DB] Query error` / connection refused**: Ensure PostgreSQL is running and verify `DATABASE_URL` in `.env.local`.
- **Redirected back to `/login` after signing in**: Ensure `database/schema.sql` has been executed (`sessions` table exists) and `SESSION_SECRET` is configured.
- **`sharp` install or runtime error**: Run `npm rebuild sharp` using Node.js `20+`.
- **Port `3000` already in use**: Stop the conflicting process or run `npx next dev -p 3001`.

</details>

<a id="project-structure"></a>

## 📂 Project Structure

```text
arthive-art-showcase/
├── database/
│   ├── schema.sql                  # 11-table PostgreSQL schema, constraints & indexes
│   └── seed.sql                    # Idempotent demo users, categories, artworks & challenges
├── docs/
│   └── assets/
│       └── archive-hero-banner.svg # Custom deep-navy architectural SVG banner
├── public/
│   ├── logo/                       # Official ARCHIVE SVGs and favicons
│   └── uploads/                    # Local storage for sharp-processed artwork uploads
├── scripts/
│   ├── db-reset.mjs                # Protected local dev/test DB reset + deterministic reseed
│   ├── db-seed.mjs                 # Idempotent schema + official seed runner
│   └── db-utils.mjs                # Environment safety guards & table count audit helpers
├── src/
│   ├── app/
│   │   ├── (public)/               # Public pages: explore, artworks/[id], artists, challenges, auth
│   │   ├── api/                    # upload, challenges/search, curator-applications/[id]/cv
│   │   ├── dashboard/              # Role workspaces: admin/, curator/, member/
│   │   ├── globals.css             # Architectural editorial palette & layout styles
│   │   ├── layout.js               # Root layout loading Manrope font & favicon
│   │   └── page.js                 # Homepage exhibition
│   ├── components/
│   │   ├── artists/                # Artist directory, navigation & portfolio components
│   │   ├── dashboard/              # Account status notices & admin artwork preview
│   │   ├── home/                   # HeroSection, ArtworkGallery, ChallengesSection, ArtistsSection
│   │   ├── layout/                 # Navbar, Footer, DashboardSidebar, PublicPageContainer
│   │   └── ui/                     # DepthCarousel, Folder, ImageUpload, Breadcrumb, Modal, Toast
│   ├── lib/
│   │   ├── actions/                # Server Actions (admin, artwork, auth, challenge, curator)
│   │   ├── auth.js                 # JWT & DB session helpers, requireAuth, requireRole
│   │   ├── curator-cv.js           # Magic-byte CV validation & private storage/curator-cvs/ I/O
│   │   └── db.js                   # PostgreSQL connection pool and query helper
│   └── proxy.js                    # Optimistic JWT route guard for /dashboard/*
├── .env.example                    # Environment variable template
├── next.config.mjs                 # Next.js configuration (remote images, 10MB action body limit)
└── package.json                    # Project dependencies and npm scripts
```

<details>
<summary><strong>Additional Project &amp; Implementation Notes</strong></summary>

<br />

- **Private Curator CV Storage**: Uploaded curator CVs (`.pdf`, `.doc`, `.docx`) are saved dynamically to `storage/curator-cvs/` outside `public/` and served strictly to Admins and the applicant via `GET /api/curator-applications/[id]/cv`.
- **Artwork Search Endpoint**: `src/app/api/artworks/search/route.js` currently exists as an empty placeholder; artwork search and category filtering run server-side inside `src/app/(public)/explore/page.js`.

</details>

<a id="usage"></a>

## 📖 Usage

- **Public / Guest**: Visit `/` to explore the 3D hero carousel, search and filter works in `/explore`, browse creator portfolios in `/artists`, and inspect challenge briefs and ranked winners in `/challenges`.
- **Member / Creator**: Register or sign in at `/login` to open `/dashboard/member`. Upload artworks (`JPEG`, `PNG`, `WebP`, `GIF` up to `10 MB` or via URL), bookmark favorites, post comments, submit active works to ongoing challenges, and update your profile or password.
- **Curator**: Register as a `curator` with a portfolio link and CV. Once approved by an Administrator, use `/dashboard/curator` to create and edit challenges, inspect submissions, and assign 1st–3rd place winners with optional jury notes after the challenge end date.
- **Administrator**: Sign in to `/dashboard/admin` to verify curator applications (including viewing/downloading private CVs and rejecting with documented reasons), activate or deactivate non-admin accounts, manage categories, oversee platform challenges, and resolve artwork reports.

<a id="contributing"></a>

## 🤝 Contributing

Contributions, issues, and feature improvements are welcome.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Verify your changes with `npm run lint` and `npm run build`.
4. Commit using Conventional Commits:
   - `feat: add challenge winner note display`
   - `fix: resolve curator CV download header encoding`
   - `refactor: extract shared dashboard breadcrumb helper`
   - `docs: update README architecture diagram`
5. Open a Pull Request explaining the purpose and verification of your changes.

<a id="license"></a>

## 📄 License

No `LICENSE` file is currently specified in this repository. All rights remain with the repository author unless a license is added.

<a id="author"></a>

## 👤 Author

**aalfm** — [GitHub](https://github.com/aalfm) · [ARCHIVE Repository](https://github.com/aalfm/arthive-art-showcase)
