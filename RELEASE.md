# GameOn Co. — Public Release Documentation

**Version**: 1.0.0  
**Release Date**: March 2026  
**Repository**: [github.com/rhythmshokeen/the_gameon_co](https://github.com/rhythmshokeen/the_gameon_co)  
**Live URL**: *(Deployed on Vercel)*

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Features](#4-features)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Feature Hub (6 Core Modules)](#6-feature-hub-6-core-modules)
7. [Dashboard System](#7-dashboard-system)
8. [API Reference](#8-api-reference)
9. [Database Schema](#9-database-schema)
10. [Authentication System](#10-authentication-system)
11. [Competition Scraping Engine](#11-competition-scraping-engine)
12. [UI Component Library](#12-ui-component-library)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Security](#14-security)
15. [Project Structure](#15-project-structure)
16. [Environment Variables](#16-environment-variables)
17. [Getting Started (Development)](#17-getting-started-development)
18. [Known Limitations & Roadmap](#18-known-limitations--roadmap)

---

## 1. Product Overview

**GameOn Co.** is a professional **Sports Talent Marketplace** that connects athletes, coaches, and academies through verified competitions and structured performance profiles.

### What It Does
- **Athletes** build verified performance profiles, enter competitions, track stats, and get discovered by coaches/scouts.
- **Coaches & Scouts** discover athletes by sport, position, and performance data. They connect with athletes directly.
- **Organizers & Academies** create and manage competitions, review applications, and track analytics.

### Core Value Proposition
> "Turn Talent Into Opportunity" — No middlemen, no noise. Just data-driven sports talent discovery.

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.6 | Full-stack React framework (App Router) |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Framer Motion** | 12.34.4 | Page animations & transitions |
| **Inter** (Google Fonts) | — | Primary typeface |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js API Routes** | 16.1.6 | REST API endpoints (serverless) |
| **NextAuth.js** | 4.24.13 | Authentication (JWT + OAuth) |
| **Prisma ORM** | 7.4.2 | Database access & migrations |
| **Zod** | 4.3.6 | Runtime schema validation |
| **bcrypt.js** | 3.0.3 | Password hashing |

### Database
| Technology | Purpose |
|---|---|
| **PostgreSQL** (Neon) | Primary database (serverless Postgres) |
| **Prisma Adapter (pg)** | Direct TCP connection to Postgres |
| **Prisma Migrations** | Schema versioning & migrations |

### UI Components
| Technology | Purpose |
|---|---|
| **Radix UI** | Accessible headless primitives (Dialog, Dropdown, Select, Tabs, Avatar, etc.) |
| **class-variance-authority** | Variant-based component styling |
| **tailwind-merge** | Intelligent Tailwind class merging |
| **Lucide React** | Icon library (576+ icons) |
| **Sonner** | Toast notifications |

### Infrastructure
| Service | Purpose |
|---|---|
| **Vercel** | Hosting, CI/CD, serverless functions |
| **Neon** | Managed serverless PostgreSQL |
| **Google Cloud** | OAuth 2.0 provider |
| **GitHub** | Source control |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│  Next.js App Router (React 19 + TypeScript)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Landing  │ │ Auth     │ │ Feature Hub          │ │
│  │ Page     │ │ Pages    │ │ (6 modules)          │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │ Role-Based Dashboard (Athlete/Coach/Organizer)  ││
│  └──────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│                  MIDDLEWARE                          │
│  NextAuth JWT verification + Role-based routing     │
├─────────────────────────────────────────────────────┤
│                  API LAYER                           │
│  45+ REST endpoints (Next.js Route Handlers)        │
│  Zod validation · Prisma queries · Auth guards      │
├─────────────────────────────────────────────────────┤
│                  DATA LAYER                          │
│  Prisma ORM → PostgreSQL (Neon)                     │
│  25+ models · Indexes · Cascading deletes           │
├─────────────────────────────────────────────────────┤
│               SCRAPING ENGINE                        │
│  3 scrapers (BookMyShow, Townscript, Tournaments360)│
│  Normalized pipeline → DB upsert with dedup         │
└─────────────────────────────────────────────────────┘
```

---

## 4. Features

### Public Pages
- **Landing Page** — Animated hero, features grid, how-it-works, role breakdown, CTA section, footer
- **Login** — Email/password + Google OAuth
- **Register** — Name, email, password, role selection (Athlete/Coach/Organizer)

### Authenticated Features
- **Feature Hub** — Central navigation to all 6 modules (Compete, Learn, Connect, Apply, Recover, Track)
- **Role-Based Dashboard** — Personalized for each role with relevant navigation, stats, and actions
- **Global Search** — Search across athletes, competitions, and organizers
- **Profile Management** — Edit athlete profile, stats, achievements, media highlights
- **Settings** — Account management

---

## 5. User Roles & Permissions

| Feature | Athlete | Coach | Organizer |
|---|:---:|:---:|:---:|
| View competitions | ✅ | ✅ | ✅ |
| Apply to competitions | ✅ | ❌ | ❌ |
| Create competitions | ❌ | ❌ | ✅ |
| Edit/delete own competitions | ❌ | ❌ | ✅ |
| Manage applications | ❌ | ❌ | ✅ |
| Athlete profile & stats | ✅ | ❌ | ❌ |
| Discover athletes | ❌ | ✅ | ❌ |
| View athlete detail | ❌ | ✅ | ✅ |
| Send/receive connections | ✅ | ✅ | ✅ |
| View analytics | ❌ | ❌ | ✅ |
| Feature Hub access | ✅ | ✅ | ✅ |
| Track performance | ✅ | ❌ | ❌ |
| Recovery logging | ✅ | ❌ | ❌ |
| Learning paths | ✅ | ✅ | ❌ |

### Route Protection
Middleware protects all routes except `/`, `/auth/*`, and `/api/auth/*`. Role-based redirects prevent unauthorized access to role-specific dashboard sections.

---

## 6. Feature Hub (6 Core Modules)

### 🏆 COMPETE
Browse, filter, and apply to verified competitions. View competition details including sport, location, dates, level, entry fee, organizer, and scout attendance. Athletes can apply directly from the competition page.

**Pages**: `/compete`, `/compete/[id]`  
**API**: `GET /api/compete`, `GET /api/compete/[id]`, `POST /api/compete/apply`

### 📚 LEARN
Structured learning paths with modules organized by category (Sport Fundamentals, Nutrition, Mental Training, Performance Science). Each module has a difficulty level (Beginner/Advanced/Elite), estimated duration, and prerequisites. Progress is tracked per user.

**Pages**: `/learn`  
**API**: `GET /api/learn`, `POST /api/learn/progress`

### 🤝 CONNECT
Two-part networking system:
1. **People** — Find and connect with other users (athletes, coaches, organizers). Send/accept/reject connection requests.
2. **Groups** — Create or join sport-specific groups with member limits and privacy settings.

**Pages**: `/connect`  
**API**: `GET /api/connect/people`, `GET /api/connect/groups`, `POST /api/connect/groups`, `POST /api/connect/groups/join`

### 📩 APPLY
Opportunity gateway for scholarships, team trials, club contracts, internships, and camps. Users can submit applications with cover letters, resumes, and recommendation links. Includes a metrics snapshot captured at time of application.

**Pages**: `/apply`  
**API**: `GET /api/apply`, `POST /api/apply`, `GET /api/apply/my`

### ❤️‍🩹 RECOVER
Health & longevity system with:
1. **Injury Records** — Log injuries with body part, severity (Minor/Moderate/Severe), and status tracking (Active → Recovering → Recovered)
2. **Recovery Logs** — Daily wellness tracking: sleep hours, sleep quality, stress level, muscle soreness, energy level, training load

**Pages**: `/recover`  
**API**: `GET /api/recover/injuries`, `POST /api/recover/injuries`, `GET /api/recover/logs`, `POST /api/recover/logs`

### 📊 TRACK
Performance analytics with training session logging. Track:
- Session type (Training/Match/Recovery)
- Duration, intensity (RPE), calories burned
- Speed (avg/max), distance, heart rate (avg/max)
- Skill accuracy percentage
- Notes per session

**Pages**: `/track`  
**API**: `GET /api/track`, `POST /api/track`

---

## 7. Dashboard System

Each role gets a tailored dashboard at `/dashboard`:

### Athlete Dashboard
- Profile completion status
- Recent competition applications
- Performance stats overview
- Quick links to profile, competitions, applications, connections, search

### Coach Dashboard
- Athlete discovery tools
- Competition browsing
- Connection management
- Search functionality

### Organizer Dashboard
- Competition management (create, edit, delete)
- Application review & management
- Competition analytics (total events, applications, participants)
- Search functionality

### Dashboard Pages
| Page | Path | Description |
|---|---|---|
| Dashboard Home | `/dashboard` | Role-specific overview |
| Profile | `/dashboard/profile` | Edit athlete profile, stats, achievements, media |
| Competitions | `/dashboard/competitions` | Browse/manage competitions |
| Create Competition | `/dashboard/competitions/create` | Organizer: create new competition |
| Competition Detail | `/dashboard/competitions/[id]` | View competition details |
| Edit Competition | `/dashboard/competitions/[id]/edit` | Organizer: edit competition |
| Applications | `/dashboard/applications` | View/manage applications |
| Connections | `/dashboard/connections` | Manage connections |
| Discover | `/dashboard/discover` | Coach: discover athletes |
| Athlete Detail | `/dashboard/athletes/[id]` | View athlete's full profile |
| Analytics | `/dashboard/analytics` | Organizer: competition analytics |
| Search | `/dashboard/search` | Global search |
| Settings | `/dashboard/settings` | Account settings |

---

## 8. API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user (email/password) |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth.js handler (login, session, callback, signout) |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile` | Get current user's athlete profile |
| PUT | `/api/profile` | Update athlete profile |
| POST | `/api/profile/stats` | Add a performance stat |
| DELETE | `/api/profile/stats` | Remove a performance stat |
| POST | `/api/profile/achievements` | Add an achievement |
| DELETE | `/api/profile/achievements` | Remove an achievement |
| POST | `/api/profile/media` | Add a media highlight |
| DELETE | `/api/profile/media` | Remove a media highlight |

### Competitions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/competitions` | List competitions (with filters) |
| POST | `/api/competitions` | Create competition (Organizer only) |
| GET | `/api/competitions/[id]` | Get competition detail |
| PUT | `/api/competitions/[id]` | Update competition (owner only) |
| DELETE | `/api/competitions/[id]` | Delete competition (owner only) |

### Compete (Public-facing)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/compete` | List verified competitions for browsing |
| GET | `/api/compete/[id]` | Competition detail with organizer info |
| POST | `/api/compete/apply` | Apply to a competition |
| POST | `/api/compete/sync` | Trigger scraper sync (admin) |
| GET | `/api/compete/sync` | Get last sync status |

### Athletes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/athletes` | List athletes (with sport/position filters) |
| GET | `/api/athletes/[id]` | Get full athlete profile |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/applications` | List applications (filtered by role) |
| POST | `/api/applications` | Submit an application |
| PATCH | `/api/applications/[id]` | Update application status |

### Connections
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/connections` | List user's connections |
| POST | `/api/connections` | Send connection request |
| PATCH | `/api/connections/[id]` | Accept/reject connection |
| DELETE | `/api/connections/[id]` | Remove connection |

### Connect (People & Groups)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/connect/people` | Discover people to connect with |
| GET | `/api/connect/groups` | List available groups |
| POST | `/api/connect/groups` | Create a new group |
| POST | `/api/connect/groups/join` | Join a group |

### Learn
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/learn` | Get all learning paths with modules |
| POST | `/api/learn/progress` | Update module progress |

### Apply (Opportunities)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/apply` | List opportunities |
| POST | `/api/apply` | Submit opportunity application |
| GET | `/api/apply/my` | Get user's applications |

### Recover
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recover/injuries` | List user's injury records |
| POST | `/api/recover/injuries` | Log a new injury |
| GET | `/api/recover/logs` | Get recovery logs |
| POST | `/api/recover/logs` | Log daily recovery data |

### Track
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/track` | Get user's training sessions |
| POST | `/api/track` | Log a training session |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics` | Get organizer competition analytics |

### Search
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/search?query=...&type=...` | Global search (athletes, competitions, organizers) |

**Total: 45+ API endpoints**

---

## 9. Database Schema

### 25 Models across 6 domains:

#### Core
| Model | Description |
|---|---|
| `User` | Central user model with role (ATHLETE/COACH/ORGANIZER) |
| `Account` | OAuth accounts (NextAuth) |
| `Session` | User sessions (NextAuth) |
| `VerificationToken` | Email verification tokens |

#### Athlete Profile System
| Model | Description |
|---|---|
| `AthleteProfile` | Sport, position, bio, physical stats, experience |
| `PerformanceStat` | Named metrics with values and units |
| `Achievement` | Titles, descriptions, dates |
| `MediaHighlight` | Images, videos, documents (by URL) |

#### Competition System
| Model | Description |
|---|---|
| `Competition` | Tournaments, trials, tryouts with full metadata |
| `Application` | Athlete applications to competitions |
| `ScrapeLog` | Scraper execution logs for monitoring |

#### Networking
| Model | Description |
|---|---|
| `Connection` | User-to-user connections with status |
| `Group` | Sport-specific groups/team rooms |
| `GroupMember` | Group membership with roles |

#### Learning
| Model | Description |
|---|---|
| `LearningPath` | Structured learning categories |
| `LearningModule` | Individual lessons with content |
| `UserModuleProgress` | Per-user progress tracking |

#### Opportunities
| Model | Description |
|---|---|
| `Opportunity` | Scholarships, trials, contracts, internships, camps |
| `OpportunityApplication` | Applications with cover letters, resumes, metrics |

#### Recovery & Health
| Model | Description |
|---|---|
| `InjuryRecord` | Injury tracking with severity and status |
| `RehabProgram` | Rehabilitation programs with exercises |
| `RecoveryLog` | Daily wellness metrics (sleep, stress, energy, soreness) |

#### Performance
| Model | Description |
|---|---|
| `TrainingSession` | Session logs with speed, distance, heart rate, RPE |
| `ActivityLog` | General user activity tracking |

### Enums
`Role`, `VerificationStatus`, `ApplicationStatus`, `ConnectionStatus`, `MediaType`, `CompetitionType`, `OpportunityType`, `OpportunityAppStatus`, `ModuleLevel`, `InjurySeverity`, `InjuryStatus`

---

## 10. Authentication System

### Methods
1. **Email/Password** — Registration with Zod validation (min 8 chars, uppercase, lowercase, number). Passwords hashed with bcrypt.
2. **Google OAuth** — One-click sign-in via Google. New users are auto-assigned the ATHLETE role.

### How It Works
- **NextAuth.js** with JWT strategy (30-day session lifetime)
- **PrismaAdapter** for OAuth account linking
- Custom JWT callback stores `userId` and `role` in the token
- Custom session callback exposes `id` and `role` to the client
- `allowDangerousEmailAccountLinking: true` lets users link Google + email accounts

### Protected Routes
Middleware (NextAuth `withAuth`) protects:
- `/hub/*`, `/dashboard/*`, `/compete/*`, `/learn/*`, `/connect/*`, `/apply/*`, `/recover/*`, `/track/*`

Public routes: `/`, `/auth/*`, `/api/auth/*`

---

## 11. Competition Scraping Engine

### Overview
GameOn Co. includes an automated scraping system that pulls real competition data from 3 Indian sports event platforms:

### Scrapers
| Source | Platform | Key |
|---|---|---|
| **BookMyShow** | bookmyshow.com | `bookmyshow` |
| **Townscript** | townscript.com | `townscript` |
| **Tournaments360** | tournaments360.com | `tournaments360` |

### How It Works
1. Each scraper implements the `ScraperModule` interface (`scrape()` + `normalize()`)
2. Raw events (`ScrapedEvent`) are scraped from the source
3. Events are normalized into `NormalizedCompetition` format
4. The `ScraperService` upserts into the database with deduplication (`sourceId` + `source`)
5. Each run is logged to `ScrapeLog` for monitoring

### Trigger
- API: `POST /api/compete/sync` (admin-triggered)
- Scripts: `script/scrape-bms.ts`, `script/scrape-t360.ts`, `script/scrape-townscript.ts`
- Seed: `script/seed-competitions.ts`

### Deduplication
Uses a composite unique constraint: `@@unique([title, startDate, source])` to prevent duplicate entries across syncs.

---

## 12. UI Component Library

Custom-built component library using **Radix UI** primitives + **Tailwind CSS** + **CVA** variants:

| Component | File | Based On |
|---|---|---|
| `Button` | `ui/button.tsx` | Custom (6 variants × 5 sizes) |
| `Card` | `ui/card.tsx` | Custom |
| `Input` | `ui/input.tsx` | Custom |
| `Label` | `ui/label.tsx` | Radix Label |
| `Select` | `ui/select.tsx` | Radix Select |
| `Dialog` | `ui/dialog.tsx` | Radix Dialog |
| `Dropdown Menu` | `ui/dropdown-menu.tsx` | Radix DropdownMenu |
| `Tabs` | `ui/tabs.tsx` | Radix Tabs |
| `Avatar` | `ui/avatar.tsx` | Radix Avatar |
| `Badge` | `ui/badge.tsx` | Custom |
| `Separator` | `ui/separator.tsx` | Radix Separator |
| `Skeleton` | `ui/skeleton.tsx` | Custom |
| `Progress` | `ui/progress.tsx` | Custom |
| `Textarea` | `ui/textarea.tsx` | Custom |
| `Sonner` | `ui/sonner.tsx` | Sonner (toast) |

### Button Variants
- `default` (indigo), `destructive` (red), `outline`, `secondary`, `ghost`, `link`
- Sizes: `default`, `sm`, `lg`, `xl`, `icon`

### Design System
- **Dark theme** — Background `#0b0d14`, cards `#111827`, borders `#1e293b`
- **Primary color** — Indigo `#6366f1`
- **Glass morphism** — Frosted glass nav with backdrop blur
- **Animations** — Fade-in-up, shimmer, pulse-glow, gradient text
- **Custom scrollbar** — Thin 6px scrollbar matching the theme

---

## 13. Deployment & Infrastructure

### Hosting: Vercel
- Automatic deployments on push to `main`
- Serverless functions for all API routes
- Edge network for static assets
- Environment variables managed in Vercel dashboard

### Database: Neon (Serverless PostgreSQL)
- Host: `ep-round-mouse-ai6u7it2...neon.tech`
- Auto-scaling, branching support
- Connection pooling (pooled URL) + Direct TCP connection

### Build Configuration
- **Build command**: `prisma generate && next build`
- **Post-install**: `prisma generate` (ensures Prisma client on deploy)
- **Root directory**: `gameon-co` (project is in a subdirectory)
- **Framework**: Next.js (auto-detected)

---

## 14. Security

| Measure | Implementation |
|---|---|
| **Password Hashing** | bcrypt.js with salt rounds |
| **JWT Authentication** | NextAuth.js with 30-day expiry |
| **Route Protection** | Middleware guards all authenticated routes |
| **Role-Based Access** | API endpoints check user role before operations |
| **Input Validation** | Zod schemas on all API inputs |
| **CSRF Protection** | Built into NextAuth.js |
| **SQL Injection Prevention** | Prisma parameterized queries |
| **Environment Secrets** | `.env` gitignored, secrets in Vercel env vars |
| **OAuth Security** | Google OAuth 2.0 with proper redirect URI validation |
| **Cascade Deletes** | Prisma `onDelete: Cascade` prevents orphaned records |

---

## 15. Project Structure

```
gameon-co/
├── prisma/
│   ├── schema.prisma              # Database schema (25 models)
│   └── migrations/                # SQL migration history
├── public/
│   └── logo.png                   # Brand logo
├── script/
│   ├── scrape-bms.ts              # BookMyShow scraper runner
│   ├── scrape-t360.ts             # Tournaments360 scraper runner
│   ├── scrape-townscript.ts       # Townscript scraper runner
│   └── seed-competitions.ts       # Competition seeder
├── src/
│   ├── middleware.ts               # Auth + role-based route protection
│   ├── app/
│   │   ├── layout.tsx             # Root layout (Inter font, Providers)
│   │   ├── page.tsx               # Landing page (animated, public)
│   │   ├── globals.css            # Theme, animations, utilities
│   │   ├── error.tsx              # Global error boundary
│   │   ├── loading.tsx            # Global loading state
│   │   ├── not-found.tsx          # 404 page
│   │   ├── auth/                  # Login, Register, Error pages
│   │   ├── hub/                   # Feature Hub (6 modules)
│   │   ├── compete/               # Competition browsing & detail
│   │   ├── learn/                 # Learning paths
│   │   ├── connect/               # Networking (people + groups)
│   │   ├── apply/                 # Opportunities
│   │   ├── recover/               # Health & recovery
│   │   ├── track/                 # Performance tracking
│   │   ├── dashboard/             # Role-based dashboard (12 sub-pages)
│   │   └── api/                   # 45+ REST API endpoints
│   ├── components/
│   │   ├── providers.tsx          # SessionProvider + Toaster
│   │   ├── feature-layout.tsx     # Shared layout for feature pages
│   │   ├── dashboard/             # Sidebar, Header, Role dashboards
│   │   └── ui/                    # 15 reusable UI components
│   ├── lib/
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── utils.ts               # cn() utility for class merging
│   │   ├── validations.ts         # Zod schemas (9 schemas)
│   │   ├── scrapers/              # 3 scraper modules + types
│   │   └── services/              # Scraper service (sync pipeline)
│   ├── generated/prisma/          # Auto-generated Prisma client
│   └── types/
│       └── next-auth.d.ts         # NextAuth type extensions
├── package.json
├── next.config.ts                 # Next.js config (React Compiler enabled)
├── tsconfig.json
├── prisma.config.ts               # Prisma config
└── postcss.config.mjs
```

---

## 16. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection (pooled, for migrations) |
| `DIRECT_DATABASE_URL` | ✅ | PostgreSQL connection (direct TCP, for runtime) |
| `NEXTAUTH_URL` | ✅ | App base URL (`http://localhost:3000` or production URL) |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char string for JWT encryption |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |

---

## 17. Getting Started (Development)

```bash
# 1. Clone the repository
git clone https://github.com/rhythmshokeen/the_gameon_co.git
cd the_gameon_co/gameon-co

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database URL, NextAuth secret, etc.

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database (or run migrations)
npx prisma db push

# 6. Start development server
npm run dev

# 7. Open in browser
open http://localhost:3000
```

### Available Scripts
| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start dev server (Turbopack) |
| `build` | `prisma generate && next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run linter |
| `postinstall` | `prisma generate` | Auto-generate Prisma client |

---

## 18. Known Limitations & Roadmap

### Current Limitations
- Google OAuth requires manual setup in Google Cloud Console
- Scrapers are configured for Indian sports platforms (BookMyShow, Townscript, Tournaments360)
- No real-time notifications (connection requests, application updates)
- No file upload — media highlights use URLs only
- No in-app messaging between users
- No payment integration for competition entry fees

### Future Roadmap
- [ ] Real-time notifications (WebSocket or SSE)
- [ ] In-app messaging / chat
- [ ] File upload for media highlights and resumes
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] AI-powered athlete matching for coaches
- [ ] Advanced analytics dashboards with charts
- [ ] Email notifications for application status changes
- [ ] Admin panel for platform management
- [ ] Multi-language support

---

## Summary

GameOn Co. is a **production-ready, full-stack sports talent marketplace** built with modern web technologies. It features:

- **3 user roles** with role-based access control
- **6 core feature modules** (Compete, Learn, Connect, Apply, Recover, Track)
- **45+ API endpoints** with full CRUD operations
- **25 database models** across 6 domains
- **3 automated web scrapers** for real competition data
- **15 reusable UI components** with a consistent dark theme
- **JWT authentication** with email/password + Google OAuth
- **Serverless deployment** on Vercel with Neon PostgreSQL

---

*Built by Rhythm Shokeen · © 2026 GameOn Co. All rights reserved.*
