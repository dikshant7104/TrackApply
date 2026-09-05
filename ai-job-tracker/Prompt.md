Build a production-grade AI Job Application Tracker SaaS with a React frontend and NestJS backend.

Use the latest stable technologies, clean architecture, full testing, Docker, CI/CD, and deployment readiness.

PROJECT:
AI Job Application Tracker SaaS

TECH STACK:

Frontend:
- React latest stable version
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand or Redux Toolkit
- React Hook Form
- Zod
- Recharts
- Playwright for E2E testing

Backend:
- NestJS latest stable version
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ for background jobs
- JWT authentication with refresh tokens
- Role-based access control
- Swagger/OpenAPI documentation
- Jest for unit/integration tests
- Supertest for API tests

AI:
- OpenAI API or compatible LLM provider
- AI cover letter generator
- AI resume-job match score
- AI interview question generator
- AI job description summarizer
- Mock AI responses in tests

Deployment:
- Frontend: Vercel or Netlify
- Backend: Render, Railway, Fly.io, or AWS
- Database: Neon, Supabase, or Railway PostgreSQL
- Redis: Upstash
- Docker and docker-compose
- GitHub Actions CI/CD

CORE FEATURES:
1. Authentication
- Register
- Login
- Logout
- Refresh token rotation
- Forgot password
- Reset password
- Protected routes
- Secure password hashing with argon2
- Rate limiting

2. Job Application Management
- Create, read, update, delete job applications
- Track status:
  Saved, Applied, Interview, Technical Test, Offer, Rejected
- Fields:
  company, job title, salary, location, job URL, notes, deadline, contact person
- Search, filter, sort, and pagination

3. Resume Management
- Upload resumes
- Store resume metadata
- Delete resumes
- Choose default resume
- Parse resume text where possible

4. AI Features
- Generate tailored cover letters
- Calculate resume-job match score
- Highlight missing skills
- Suggest resume improvements
- Generate interview questions
- Summarize job descriptions

5. Dashboard & Analytics
- Total applications
- Applications by status
- Interview conversion rate
- Offer rate
- Rejection rate
- Weekly application trend
- Upcoming interviews
- Charts using Recharts

6. User Profile
- Update profile
- Change password
- Manage account settings
- Delete account

FRONTEND REQUIREMENTS:
- Modern SaaS dashboard UI
- Responsive design
- Dark mode
- Sidebar layout
- Landing page
- Auth pages
- Dashboard pages
- Job application table
- Add/edit modals
- Analytics cards
- Loading states
- Empty states
- Error states
- Toast notifications
- Accessible components
- Strong form validation with React Hook Form and Zod

BACKEND REQUIREMENTS:
- Modular NestJS architecture
- Prisma schema and migrations
- DTO validation using class-validator
- Guards, decorators, interceptors, filters
- Centralized error handling
- REST API endpoints for:
  - auth
  - users
  - applications
  - resumes
  - AI tools
  - analytics
  - interview prep
- Swagger API docs
- Secure CORS
- Environment config validation
- Logging
- Rate limiting
- File upload support
- Background jobs with BullMQ

DATABASE MODELS:
Create Prisma models for:
- User
- RefreshToken
- JobApplication
- Resume
- CoverLetter
- InterviewPrep
- AiGeneration
- AuditLog

TESTING REQUIREMENTS:
Frontend:
- Playwright E2E tests for:
  - register
  - login
  - create job application
  - edit job application
  - delete job application
  - filter applications
  - generate cover letter with mocked AI response

Backend:
- Jest unit tests
- Supertest API integration tests
- Auth tests
- CRUD tests
- Validation tests
- Permission tests
- AI service mock tests
- Test database setup

SECURITY REQUIREMENTS:
- Argon2 password hashing
- JWT access tokens
- Refresh token rotation
- HttpOnly cookies if suitable
- Secure CORS
- Rate limiting
- Input validation
- SQL injection protection through Prisma
- Environment variables
- Never expose secrets
- Production security notes

PROJECT STRUCTURE:
Use a monorepo:

apps/
  web/        React + TypeScript + Vite frontend
  api/        NestJS backend

packages/
  shared/     shared types, schemas, constants if useful

Include:
- Dockerfile for frontend
- Dockerfile for backend
- docker-compose.yml for local PostgreSQL, Redis, frontend, and backend
- .env.example files
- GitHub Actions CI/CD workflow
- README.md
- Deployment guide
- Testing guide
- Architecture overview

DEPLOYMENT REQUIREMENTS:
- Frontend deployment instructions for Vercel/Netlify
- Backend deployment instructions for Render/Railway/Fly.io
- PostgreSQL setup using Neon/Supabase
- Redis setup using Upstash
- Environment variable setup
- Production build commands
- Database migration commands
- CI/CD workflow that runs tests before deployment

IMPORTANT:
- Do not build a toy project.
- Do not skip testing.
- Do not skip deployment.
- Do not skip security.
- Do not hardcode secrets.
- Do not use outdated libraries.
- Do not ignore error handling.
- Use clean, scalable, maintainable code.
- Use production-ready folder structure.
- Add comments only where useful.
- Include Playwright tests, not Jest/Vitest for frontend E2E.
- Make it suitable for a professional portfolio and real SaaS deployment.

FINAL OUTPUT:
1. Complete project structure
2. Frontend implementation
3. Backend implementation
4. Prisma schema and migrations
5. AI service implementation
6. Testing setup
7. Docker setup
8. GitHub Actions workflow
9. Deployment instructions
10. README.md
