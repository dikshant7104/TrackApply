# 🚀 TrackApply — AI Job Application Tracker SaaS

A production-grade, full-stack SaaS for tracking job applications with AI-powered cover letters, resume match scoring, interview prep, and analytics.
---
## 🏗 Architecture Overview

```
ai-job-tracker/
├── apps/
│   ├── web/          # React + TypeScript + Vite (Frontend)
│   └── api/          # NestJS + TypeScript (Backend)
├── packages/
│   └── shared/       # Shared types, enums, constants
├── docker-compose.yml
└── .github/workflows/ci.yml
```

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form, Zod, Recharts, Playwright

**Backend:** NestJS 10, TypeScript, PostgreSQL, Prisma ORM, Redis, BullMQ, JWT auth, Swagger, Jest

**AI:** OpenAI GPT-4o (with automatic mock fallback — no API key needed for development)

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- Docker Desktop

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-username/ai-job-tracker.git
cd ai-job-tracker
npm install
```

### 2. Start the database and Redis

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 3. Configure environment

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and set:
- `DATABASE_URL` (already set for Docker Compose)
- `JWT_SECRET` — generate with: `openssl rand -base64 64`
- `JWT_REFRESH_SECRET` — generate with: `openssl rand -base64 64`
- `OPENAI_API_KEY` — optional, mock responses used if empty

### 4. Run database migrations and seed

```bash
cd apps/api
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
cd ../..
```

### 5. Start the development servers

```bash
# Starts both frontend and backend concurrently
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/v1
- **Swagger docs:** http://localhost:3001/api/docs

### Demo credentials
```
Email: demo@example.com
Password: Demo123!
```

---

## 🧪 Testing

### Backend unit tests

```bash
cd apps/api
npm test             # Run all tests
npm run test:cov     # With coverage report
npm run test:watch   # Watch mode
```

### Frontend E2E tests (Playwright)

```bash
cd apps/web

# Run E2E tests (requires running app)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

---

## 🐳 Docker (Full Stack)

```bash
# Build and start all services
cp apps/api/.env.example .env
# Edit .env — set JWT_SECRET, JWT_REFRESH_SECRET

docker compose up --build

# With database migrations
docker compose exec api npx prisma migrate deploy
docker compose exec api npx ts-node prisma/seed.ts
```

Services:
- Frontend: http://localhost
- API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 🌐 Deployment

### Backend → Railway (Recommended)

1. Push code to GitHub
2. Create a new project at [railway.app](https://railway.app)
3. Add a PostgreSQL plugin and Redis plugin
4. Connect your GitHub repo, select `apps/api`
5. Set environment variables:
   ```
   DATABASE_URL      (auto-set by Railway PostgreSQL plugin)
   REDIS_HOST        (auto-set by Railway Redis plugin)
   JWT_SECRET        (openssl rand -base64 64)
   JWT_REFRESH_SECRET (openssl rand -base64 64)
   FRONTEND_URL      https://your-app.vercel.app
   OPENAI_API_KEY    (optional)
   NODE_ENV          production
   ```
6. Set build command: `npm run build`
7. Set start command: `npm run start:prod`
8. Set healthcheck path: `/api/v1/health`

### Frontend → Vercel (Recommended)

1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `apps/web`
4. Set environment variables:
   ```
   VITE_API_URL=https://your-api.railway.app/api/v1
   ```
5. Deploy

### Database → Neon (PostgreSQL)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set `DATABASE_URL` in your API environment
4. Run: `npx prisma migrate deploy`

### Redis → Upstash

1. Create a Redis database at [upstash.com](https://upstash.com)
2. Copy host, port, and password
3. Set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in your API environment

### Manual migration on deploy

```bash
# Run after each deployment
npx prisma migrate deploy
```

---

## 📡 API Reference

Full Swagger documentation is available at `/api/docs` in development.

### Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/applications` | List applications (paginated) |
| POST | `/api/v1/applications` | Create application |
| PUT | `/api/v1/applications/:id` | Update application |
| DELETE | `/api/v1/applications/:id` | Delete application |
| POST | `/api/v1/resumes/upload` | Upload resume (PDF/Word) |
| GET | `/api/v1/analytics/dashboard` | Dashboard metrics |
| POST | `/api/v1/ai/applications/:id/cover-letter` | Generate cover letter |
| POST | `/api/v1/ai/applications/:id/match-score` | Resume match score |
| POST | `/api/v1/ai/applications/:id/interview-questions` | Interview questions |
| POST | `/api/v1/ai/summarize-job` | Summarize job description |

---

## 🔒 Security Features

- **Argon2** password hashing (industry standard, more secure than bcrypt)
- **JWT access tokens** with 15-minute expiry
- **Refresh token rotation** — each refresh invalidates the previous token
- **Rate limiting** — per-route with NestJS Throttler
- **Helmet** — HTTP security headers
- **CORS** — restricted to configured origins
- **Input validation** — DTO class-validator + Zod on frontend
- **SQL injection protection** — Prisma parameterized queries
- **Secrets** — never hardcoded, always from environment variables

---

## 📦 Database Schema

```
User ──< RefreshToken
     ──< JobApplication ──< InterviewPrep
     ──< Resume
     ──< CoverLetter
     ──< AiGeneration
     ──< AuditLog
```

---

## 🤖 AI Features

All AI features work **with or without an OpenAI API key**:

- **With API key** — real GPT-4o responses
- **Without API key** — realistic mock responses (great for development)

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Cover Letter | `POST /ai/applications/:id/cover-letter` | Tailored cover letter based on JD + resume |
| Match Score | `POST /ai/applications/:id/match-score` | 0-100 score + matched/missing skills |
| Interview Questions | `POST /ai/applications/:id/interview-questions` | Role-specific question bank |
| Job Summary | `POST /ai/summarize-job` | Extract key requirements and tech stack |
| Resume Improvements | `POST /ai/applications/:id/resume-improvements` | Actionable improvement suggestions |

---

## 📁 Project Structure

```
apps/api/src/
├── auth/           # JWT auth, refresh tokens, password reset
├── users/          # Profile management
├── applications/   # Job application CRUD
├── resumes/        # File upload and management
├── ai/             # OpenAI integration
├── analytics/      # Dashboard metrics
├── interview-prep/ # Interview preparation
└── common/
    ├── decorators/ # CurrentUser, Roles
    ├── filters/    # Global exception filter
    ├── guards/     # JWT, Roles guards
    ├── interceptors/ # Transform, Logging
    └── prisma/     # PrismaService

apps/web/src/
├── components/
│   ├── applications/ # ApplicationModal
│   ├── layout/     # DashboardLayout, Sidebar
│   └── ui/         # StatusBadge, StatCard, EmptyState
├── hooks/          # useApi.ts (all React Query hooks)
├── lib/            # api.ts (axios client), utils.ts
├── pages/
│   ├── auth/       # Login, Register, ForgotPassword
│   └── dashboard/  # Dashboard, Applications, Analytics, Resumes, Profile
└── stores/         # auth.store.ts (Zustand)
```

---

## 🛠 Development Scripts

```bash
# Root
npm run dev           # Start both frontend and backend
npm run build         # Build all packages

# Backend (apps/api)
npm run dev           # Start with hot reload
npm run start:prod    # Production start
npm test              # Unit tests
npm run prisma:studio # Open Prisma Studio

# Frontend (apps/web)
npm run dev           # Vite dev server
npm run build         # Production build
npm run test:e2e      # Playwright tests
npm run test:e2e:ui   # Playwright interactive UI
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a pull request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
