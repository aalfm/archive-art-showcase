# ARTHIVE

> Where Architecture Meets Digital Expression.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-1A1917?style=flat-square&logo=nextdotjs&logoColor=F7F5F0)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-1A1917?style=flat-square&logo=react&logoColor=F7F5F0)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-303438?style=flat-square&logo=postgresql&logoColor=F7F5F0)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-303438?style=flat-square&logo=tailwindcss&logoColor=F7F5F0)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-8C7963?style=flat-square)](https://gsap.com/)

[About The Project](#about-the-project) · [Features](#features) · [Preview](#preview) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Usage](#usage)

---

## About The Project

**ARTHIVE** is a digital architecture showcase platform designed to bring together architects, digital artists, curators, and spatial design enthusiasts through creative exhibitions, curated challenges, and architectural visual exploration.

General-purpose social feeds rarely give spatial design the structure it needs. ARTHIVE addresses this by organizing works around architectural movements (such as Modern, Brutalist, Organic, Parametric, and Sustainable Architecture), pairing editorial presentation with role-separated workflows for **Members**, **Curators**, and **Administrators**.

---

## Features

- **Interactive Public Exhibition** — Explore a GSAP-powered 3D `DepthCarousel` hero (`/`), filterable artwork gallery (`/explore`), artist directory (`/artists`), and active or upcoming design challenges (`/challenges`).
- **Member Creative Studio** — Upload and manage artworks (`/dashboard/member/artworks`) via local `sharp`-processed uploads or external URLs, bookmark favorites, submit entries to challenges, and engage through likes and comments.
- **Curator Challenge Management** — Create and manage time-bound architectural competitions (`/dashboard/curator/challenges`), review participant entries, and rank 1st–3rd place winners once judging closes.
- **Admin Governance & Moderation** — Verify pending curator applications (`/dashboard/admin/curators`), manage user activation status (`/dashboard/admin/users`), maintain categories (`/dashboard/admin/categories`), and moderate reported artworks (`/dashboard/admin/reports`).

<details>
<summary><strong>Explore Detailed Role Capabilities & Permissions Matrix</strong></summary>

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

</details>

<details>
<summary><strong>Explore System Architecture & Database Schema (Mermaid Diagrams)</strong></summary>

### Application Architecture

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

### Database Entity-Relationship Diagram

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

</details>

---

## Preview

> **Screenshots Pending:** Application screenshots have not been added to the repository yet.
>
> Planned captures for this section:
> - **Homepage Exhibition**: 3D `DepthCarousel` hero, curated artwork gallery, active challenges, and artist showcase.
> - **Explore & Artwork Detail**: Search, category filters, sorting, likes, favorites, and community comments.
> - **Role Dashboards**: Dedicated workspaces for Members, Curators, and Administrators.

---

## Tech Stack

- **Frontend:** Next.js `16.4.6` (App Router), React `19.3.0`, React DOM `19.3.0`, Tailwind CSS `4.3.3` (`@tailwindcss/turbopack`), GSAP `^3.13.0`, Manrope (`next/font/google`), Custom SVG Icons
- **Backend:** Next.js Server Actions & Route Handlers, `jose` `^6.2.18` (HS256 JWT), `bcryptjs` `^3.0.3`, `sharp` `^0.35.5`, `uuid` `^14.0.3`
- **Database:** PostgreSQL `14+` (`pg` `^8.23.1`) with parameterized SQL queries and DB-backed `sessions`
- **Tools:** ESLint `^9`, `eslint-config-next` `16.4.6`, Node.js `20+`, npm

---

## Getting Started

### Prerequisites

- **Node.js** `20+`
- **npm**
- **PostgreSQL** `14+`

### Installation

1. Clone the repository.

   ```bash
   git clone https://github.com/aalfm/arthive-art-showcase.git
   ```

2. Navigate to the project directory.

   ```bash
   cd arthive-art-showcase
   ```

3. Install dependencies.

   ```bash
   npm install
   ```

4. Configure environment variables.

   ```bash
   cp .env.example .env.local
   ```

   Update `DATABASE_URL` and `SESSION_SECRET` inside `.env.local` to match your local PostgreSQL setup.

5. Initialize the PostgreSQL database (`schema.sql` first, then `seed.sql`).

   ```bash
   psql -U postgres -c "CREATE DATABASE arthive_db;"
   psql -U postgres -d arthive_db -f database/schema.sql
   psql -U postgres -d arthive_db -f database/seed.sql
   ```

6. Run the development server.

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` in your browser.

<details>
<summary><strong>Environment Variables & Demo Accounts</strong></summary>

### Environment Variables (`.env.example`)

| Variable | Description | Required | Example |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by `src/lib/db.js`. | Yes | `postgresql://postgres:your_password@localhost:5432/arthive_db` |
| `SESSION_SECRET` | Secret key (32+ chars recommended) for HS256 JWT cookies. | Yes (Prod) | `replace-with-a-random-32-char-secret` |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the application. | No | `http://localhost:3000` |

### Demo Accounts (`database/seed.sql`)

| Role | Email | Password | Status |
|---|---|---|---|
| Admin | `admin@arthive.com` | `Admin@123` | Active |
| Curator | `kurator@arthive.com` | `Curator@123` | Approved |
| Member | `member@arthive.com` | `Member@123` | Active |

</details>

---

## Project Structure

```text
arthive-art-showcase/
├── database/
│   ├── schema.sql                  # PostgreSQL schema, constraints, and indexes (10 tables)
│   └── seed.sql                    # Idempotent demo users, categories, artworks, and challenges
├── public/
│   ├── logo/                       # Brand SVGs and favicons
│   └── uploads/                    # Local storage for sharp-processed artwork uploads
├── src/
│   ├── app/
│   │   ├── (public)/               # Public routes: explore, artworks/[id], artists, challenges, login, register
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
│   │   ├── globals.css             # Editorial design tokens and global styles
│   │   ├── layout.js               # Root layout with Manrope font
│   │   └── page.js                 # Public homepage
│   ├── components/
│   │   ├── artists/                # Artist directory, navigation, and profile components
│   │   ├── dashboard/              # Account status notice components
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
├── eslint.config.mjs               # ESLint configuration
├── jsconfig.json                   # Path alias configuration (@/* -> ./src/*)
├── next.config.mjs                 # Next.js configuration (remote images, 10MB action body limit)
├── package.json                    # Dependencies and npm scripts
└── README.md                       # Project documentation
```

---

## Usage

- **Public Visitor**: Browse the homepage exhibition (`/`), search and filter works in `/explore`, inspect artist portfolios in `/artists`, and view challenge briefs and winners in `/challenges`.
- **Member**: Register or sign in to access `/dashboard/member`. Upload artworks (JPEG, PNG, WebP, or GIF up to 10 MB, or external URL), save favorites, submit active works to challenges, and manage your profile or password.
- **Curator**: Register as a `curator` and await administrator approval at `/dashboard/curator/pending`. Once approved, create challenges, manage schedules, review entries, and select 1st–3rd place winners after a challenge ends.
- **Admin**: Sign in to `/dashboard/admin` to approve or reject curator applications, activate or deactivate user accounts (which revokes active sessions), manage categories, and dismiss or take down reported artworks.

<details>
<summary><strong>Available npm Scripts</strong></summary>

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts the Next.js development server at `http://localhost:3000`. |
| `build` | `npm run build` | Builds the application for production. |
| `start` | `npm run start` | Runs the compiled production server. |
| `lint` | `npm run lint` | Runs ESLint with `eslint-config-next` rules. |

</details>

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Verify your changes with `npm run lint` and `npm run build`.
4. Commit your changes and open a pull request.

---

## License

No `LICENSE` file is currently specified in this repository. All rights remain with the repository authors unless a license is added.

---

## Author

**aalfm** — [GitHub](https://github.com/aalfm)
