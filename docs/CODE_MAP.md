# ReachInbox — Codebase Architecture Map

This document maps all important source files in the ReachInbox repository. It details the purpose, dependencies, call hierarchies, key functions, and technologies for each component across the backend and frontend.

---

## 1. Backend Core & Configuration

### `backend/src/index.ts`
- **PURPOSE**: Server entry point that initializes the PostgreSQL database connection, initializes the Elasticsearch index, registers the BullMQ worker, and starts the Express HTTP server.
- **CALLED BY**: `npm run dev` (`tsx watch src/index.ts`), `npm start` (`node dist/src/index.js`).
- **CALLS**: `app.ts`, `config/env.ts`, `config/db.ts`, `config/elasticsearch.ts`, `queues/email.worker.ts`.
- **IMPORTANT FUNCTIONS**: `startServer()`.
- **RELATED TECHNOLOGY**: Node.js, Express, Prisma, Elasticsearch, BullMQ.

---

### `backend/src/app.ts`
- **PURPOSE**: Express application setup, configuring global security middleware (Helmet), cross-origin sharing (CORS), JSON parsing, cookie-session management, reverse proxy trust (`trust proxy: 1`), health check endpoint (`/api/health`), route mounting, and global error handling.
- **CALLED BY**: `src/index.ts`, Supertest test suites.
- **CALLS**: `routes/auth.routes.ts`, `routes/email.routes.ts`, `routes/slack.routes.ts`, `routes/queue.routes.ts`, `middleware/error.middleware.ts`.
- **IMPORTANT FUNCTIONS**: Express app instance creation and middleware pipeline.
- **RELATED TECHNOLOGY**: Express.js 5, Helmet, CORS, Cookie-Session.

---

### `backend/src/config/env.ts`
- **PURPOSE**: Centralized environment variable loader and validator with sensible fallbacks for local and production environments.
- **CALLED BY**: All backend modules requiring configuration (app, db, redis, elasticsearch, services, queues).
- **CALLS**: `dotenv`.
- **IMPORTANT FUNCTIONS**: `getEnv(key, defaultValue)`, `config` object.
- **RELATED TECHNOLOGY**: TypeScript, `dotenv`.

---

### `backend/src/config/db.ts`
- **PURPOSE**: Instantiates and exports the singleton Prisma client using the `@prisma/adapter-pg` driver adapter with a pooled PostgreSQL client.
- **CALLED BY**: Controllers, services, BullMQ worker, server bootstrap.
- **CALLS**: `@prisma/client`, `pg.Pool`, `@prisma/adapter-pg`.
- **IMPORTANT FUNCTIONS**: `prisma` client export.
- **RELATED TECHNOLOGY**: PostgreSQL 15, Prisma 7, `pg`.

---

### `backend/src/config/redis.ts`
- **PURPOSE**: Instantiates and exports the singleton `ioredis` client configured with `maxRetriesPerRequest: null` (required by BullMQ).
- **CALLED BY**: `queues/email.queue.ts`, `queues/email.worker.ts`, `services/slack.service.ts`.
- **CALLS**: `ioredis`, `config/env.ts`.
- **IMPORTANT FUNCTIONS**: `redis` connection export.
- **RELATED TECHNOLOGY**: Redis 7, `ioredis`.

---

### `backend/src/config/elasticsearch.ts`
- **PURPOSE**: Instantiates the Elasticsearch client and defines the automatic index initialization routine for the `emails` index with full mappings.
- **CALLED BY**: `src/index.ts`, `services/elasticsearch.service.ts`.
- **CALLS**: `@elastic/elasticsearch`, `config/env.ts`.
- **IMPORTANT FUNCTIONS**: `initElasticsearch()`, `esClient` export.
- **RELATED TECHNOLOGY**: Elasticsearch 8.11, `@elastic/elasticsearch`.

---

## 2. Backend Routes & Middleware

### `backend/src/routes/auth.routes.ts`
- **PURPOSE**: Declares Google OAuth 2.0 authentication endpoints.
- **CALLED BY**: `src/app.ts` (`/api/auth`).
- **CALLS**: `controllers/auth.controller.ts`.
- **ENDPOINTS**:
  - `GET /api/auth/google` $\rightarrow$ `googleAuth`
  - `GET /api/auth/google/callback` $\rightarrow$ `googleAuthCallback`
  - `GET /api/auth/me` $\rightarrow$ `me`
  - `POST /api/auth/logout` $\rightarrow$ `logout`
- **RELATED TECHNOLOGY**: Express Router.

---

### `backend/src/routes/email.routes.ts`
- **PURPOSE**: Declares campaign creation, scheduled queue retrieval, sent email history, and search endpoints.
- **CALLED BY**: `src/app.ts` (`/api/emails`).
- **CALLS**: `controllers/email.controller.ts`, `middleware/auth.middleware.ts`.
- **ENDPOINTS**:
  - `POST /api/emails/schedule` $\rightarrow$ `scheduleEmails` (Guarded by `requireAuth`)
  - `GET /api/emails/scheduled` $\rightarrow$ `getScheduledEmails` (Guarded by `requireAuth`)
  - `GET /api/emails/sent` $\rightarrow$ `getSentEmails` (Guarded by `requireAuth`)
  - `GET /api/emails/search` $\rightarrow$ `searchEmailEndpoint` (Guarded by `requireAuth`)
- **RELATED TECHNOLOGY**: Express Router.

---

### `backend/src/routes/slack.routes.ts`
- **PURPOSE**: Declares Slack OAuth v2 integration endpoints.
- **CALLED BY**: `src/app.ts` (`/api/slack`).
- **CALLS**: `controllers/slack.controller.ts`.
- **ENDPOINTS**:
  - `GET /api/slack/connect` $\rightarrow$ `connectSlack`
  - `GET /api/slack/callback` $\rightarrow$ `slackCallback`
  - `DELETE /api/slack/disconnect` $\rightarrow$ `disconnectSlack`
- **RELATED TECHNOLOGY**: Express Router.

---

### `backend/src/routes/queue.routes.ts`
- **PURPOSE**: Mounts the Bull Board web UI for real-time inspection of BullMQ queue metrics, active jobs, delayed jobs, and failed jobs.
- **CALLED BY**: `src/app.ts` (`/admin/queues`).
- **CALLS**: `@bull-board/express`, `@bull-board/api`, `queues/email.queue.ts`.
- **IMPORTANT FUNCTIONS**: `createBullBoard()`.
- **RELATED TECHNOLOGY**: BullMQ, `@bull-board/express`.

---

### `backend/src/middleware/auth.middleware.ts`
- **PURPOSE**: Guards protected API routes by verifying the presence of `req.session.userId`.
- **CALLED BY**: `routes/email.routes.ts`, `controllers/auth.controller.ts`.
- **CALLS**: None.
- **IMPORTANT FUNCTIONS**: `requireAuth(req, res, next)`.
- **RELATED TECHNOLOGY**: Express Middleware.

---

### `backend/src/middleware/error.middleware.ts`
- **PURPOSE**: Global error handler catching unhandled exceptions and returning standard JSON error payloads.
- **CALLED BY**: `src/app.ts`.
- **CALLS**: None.
- **IMPORTANT FUNCTIONS**: `errorHandler(err, req, res, next)`.
- **RELATED TECHNOLOGY**: Express Middleware.

---

## 3. Backend Controllers & Services

### `backend/src/controllers/auth.controller.ts`
- **PURPOSE**: Handles Google OAuth redirects, authorization code exchange, user creation/updates, session cookie initialization, and session status checks.
- **CALLED BY**: `routes/auth.routes.ts`.
- **CALLS**: `services/auth.service.ts`, `config/db.ts`, `config/env.ts`.
- **IMPORTANT FUNCTIONS**: `googleAuth()`, `googleAuthCallback()`, `me()`, `logout()`.
- **RELATED TECHNOLOGY**: Google OAuth 2.0, Cookie-Session.

---

### `backend/src/controllers/email.controller.ts`
- **PURPOSE**: Validates campaign parameters via Zod, persists Campaign and Email records to PostgreSQL, dispatches delayed jobs to BullMQ, retrieves scheduled/sent email logs, and manages full-text search with PostgreSQL fallback.
- **CALLED BY**: `routes/email.routes.ts`.
- **CALLS**: `config/db.ts`, `queues/email.queue.ts`, `services/elasticsearch.service.ts`, `zod`.
- **IMPORTANT FUNCTIONS**: `scheduleEmails()`, `getScheduledEmails()`, `getSentEmails()`, `searchEmailEndpoint()`.
- **RELATED TECHNOLOGY**: Zod, Prisma, BullMQ, Elasticsearch.

---

### `backend/src/controllers/slack.controller.ts`
- **PURPOSE**: Handles Slack OAuth v2 authorization redirects, authorization code exchange with Slack API, access token upserts in PostgreSQL, and connection removal.
- **CALLED BY**: `routes/slack.routes.ts`.
- **CALLS**: `config/db.ts`, `config/env.ts`, `axios`.
- **IMPORTANT FUNCTIONS**: `connectSlack()`, `slackCallback()`, `disconnectSlack()`.
- **RELATED TECHNOLOGY**: Slack OAuth v2, Axios, Prisma.

---

### `backend/src/services/auth.service.ts`
- **PURPOSE**: Encapsulates Google OAuth 2.0 URL construction, token exchange with Google OAuth API, user profile retrieval, and database user upserting.
- **CALLED BY**: `controllers/auth.controller.ts`.
- **CALLS**: `config/env.ts`, `config/db.ts`, `axios`.
- **IMPORTANT FUNCTIONS**: `getGoogleAuthUrl()`, `getGoogleUser(code)`, `findOrCreateUser(googleUser)`.
- **RELATED TECHNOLOGY**: Google OAuth 2.0, Axios, Prisma.

---

### `backend/src/services/email.service.ts`
- **PURPOSE**: Manages email delivery via Nodemailer using a 3-tier fallback strategy (Configured SMTP $\rightarrow$ Dynamic Ethereal account $\rightarrow$ Delivery emulation).
- **CALLED BY**: `queues/email.worker.ts`.
- **CALLS**: `nodemailer`, `config/env.ts`.
- **IMPORTANT FUNCTIONS**: `sendEmail(to, subject, body)`, `createConfiguredTransporter()`.
- **RELATED TECHNOLOGY**: Nodemailer, SMTP, Ethereal.

---

### `backend/src/services/elasticsearch.service.ts`
- **PURPOSE**: Provides asynchronous document indexing into the `emails` index and executes fuzzy full-text search queries (`multi_match`).
- **CALLED BY**: `queues/email.worker.ts`, `controllers/email.controller.ts`.
- **CALLS**: `config/elasticsearch.ts`.
- **IMPORTANT FUNCTIONS**: `indexEmail(email)`, `searchEmails(query, campaignId)`.
- **RELATED TECHNOLOGY**: Elasticsearch 8.11, `@elastic/elasticsearch`.

---

### `backend/src/services/slack.service.ts`
- **PURPOSE**: Dispatches rate-limit notifications to the user's Slack DM, guarded by a 1-hour Redis deduplication key (`SETNX`).
- **CALLED BY**: `queues/email.worker.ts`.
- **CALLS**: `config/db.ts`, `config/redis.ts`, `axios`.
- **IMPORTANT FUNCTIONS**: `sendRateLimitNotification(userId, currentHour)`.
- **RELATED TECHNOLOGY**: Slack Web API, Redis, Axios.

---

## 4. Backend Queues & Background Workers

### `backend/src/queues/email.queue.ts`
- **PURPOSE**: Defines the BullMQ `emailQueue` instance and exports the `scheduleEmailJob()` helper to enqueue delayed jobs with unique IDs and backoff configurations.
- **CALLED BY**: `controllers/email.controller.ts`, `routes/queue.routes.ts`.
- **CALLS**: `bullmq`, `config/env.ts`, `ioredis`.
- **IMPORTANT FUNCTIONS**: `scheduleEmailJob(emailId, userId, campaignId, scheduledAt, delayBetweenEmails, hourlyLimit)`.
- **RELATED TECHNOLOGY**: BullMQ 6, Redis 7.

---

### `backend/src/queues/email.worker.ts`
- **PURPOSE**: Core background processing worker that executes the 6-step email delivery pipeline (Atomic SQL claim, Redis Lua delay verification, hourly rate limiting, Nodemailer dispatch, status update, and Elasticsearch indexing).
- **CALLED BY**: `src/index.ts` (`import './queues/email.worker'`), `npm run worker`.
- **CALLS**: `bullmq`, `config/env.ts`, `config/db.ts`, `config/redis.ts`, `services/email.service.ts`, `services/slack.service.ts`, `services/elasticsearch.service.ts`.
- **IMPORTANT FUNCTIONS**: `processEmailJob(job)`, `emailWorker` instance.
- **RELATED TECHNOLOGY**: BullMQ, Redis Lua Scripts, Prisma, Nodemailer, Elasticsearch.

---

## 5. Database Schema & Migrations

### `backend/prisma/schema.prisma`
- **PURPOSE**: Declares the PostgreSQL relational schema for `User`, `Campaign`, `Email`, and `SlackConnection` with relationships, indexes, and constraints.
- **CALLED BY**: Prisma CLI (`prisma generate`, `prisma db push`), Prisma Client.
- **MODELS**: `User`, `Campaign`, `Email`, `SlackConnection`.
- **RELATED TECHNOLOGY**: PostgreSQL 15, Prisma 7.

---

## 6. Frontend Pages & Routing

### `frontend/src/App.tsx`
- **PURPOSE**: Root React router configuration defining public routes (`/`, `/login`) and authenticated dashboard sub-routes (`/dashboard`, `/dashboard/sent`, `/dashboard/search`).
- **CALLED BY**: `src/main.tsx`.
- **CALLS**: `pages/Landing.tsx`, `pages/Login.tsx`, `pages/Dashboard/Layout.tsx`, `pages/Dashboard/Scheduled.tsx`, `pages/Dashboard/Sent.tsx`, `pages/Dashboard/Search.tsx`, `context/AuthContext.tsx`, `context/ThemeContext.tsx`.
- **RELATED TECHNOLOGY**: React Router DOM 7.

---

### `frontend/src/pages/Landing.tsx`
- **PURPOSE**: Public marketing and architectural overview page highlighting platform capabilities, live architecture metrics card, and Google login entry.
- **CALLED BY**: `App.tsx` (`/`).
- **CALLS**: `context/AuthContext.tsx`, `components/UI.tsx`, `components/ThemeToggle.tsx`.
- **RELATED TECHNOLOGY**: React 19, Tailwind CSS, Lucide React.

---

### `frontend/src/pages/Login.tsx`
- **PURPOSE**: Dedicated authentication portal allowing users to initiate the Google OAuth flow.
- **CALLED BY**: `App.tsx` (`/login`).
- **CALLS**: `context/AuthContext.tsx`, `components/UI.tsx`, `components/ThemeToggle.tsx`.
- **RELATED TECHNOLOGY**: React 19, Tailwind CSS.

---

### `frontend/src/pages/Dashboard/Layout.tsx`
- **PURPOSE**: Main dashboard shell containing responsive top navigation, campaign creation modal trigger, Slack connection controls, theme toggle, and user profile management.
- **CALLED BY**: `App.tsx` (`/dashboard/*`).
- **CALLS**: `context/AuthContext.tsx`, `pages/Dashboard/ComposeModal.tsx`, `components/UI.tsx`, `components/ThemeToggle.tsx`.
- **RELATED TECHNOLOGY**: React 19, Tailwind CSS, Lucide React.

---

### `frontend/src/pages/Dashboard/ComposeModal.tsx`
- **PURPOSE**: Campaign composer modal supporting subject/body inputs, pacing settings (hourly limit, delay), manual recipient entry, and CSV file upload parsing via PapaParse.
- **CALLED BY**: `Dashboard/Layout.tsx`.
- **CALLS**: `api/client.ts`, `papaparse`, `components/UI.tsx`.
- **IMPORTANT FUNCTIONS**: `handleFileUpload()`, `handleSubmit()`.
- **RELATED TECHNOLOGY**: PapaParse, Axios, React Hooks.

---

### `frontend/src/pages/Dashboard/Scheduled.tsx`
- **PURPOSE**: Displays the table of pending scheduled emails with recipient details, subject lines, scheduled timestamps, and refresh controls.
- **CALLED BY**: `App.tsx` (`/dashboard`).
- **CALLS**: `api/client.ts`, `components/UI.tsx`, `date-fns`.
- **RELATED TECHNOLOGY**: React 19, Axios, date-fns.

---

### `frontend/src/pages/Dashboard/Sent.tsx`
- **PURPOSE**: Displays the outbound delivery history table with delivery timestamps, status badges (`sent` / `failed`), and Ethereal preview links.
- **CALLED BY**: `App.tsx` (`/dashboard/sent`).
- **CALLS**: `api/client.ts`, `components/UI.tsx`, `date-fns`.
- **RELATED TECHNOLOGY**: React 19, Axios, date-fns.

---

### `frontend/src/pages/Dashboard/Search.tsx`
- **PURPOSE**: Full-text search interface querying historical emails by recipient, subject, or content via Elasticsearch (with PostgreSQL fallback).
- **CALLED BY**: `App.tsx` (`/dashboard/search`).
- **CALLS**: `api/client.ts`, `components/UI.tsx`, `date-fns`.
- **RELATED TECHNOLOGY**: React 19, Axios, date-fns.

---

## 7. Frontend Shared Components & State

### `frontend/src/api/client.ts`
- **PURPOSE**: Configured Axios instance with `baseURL: VITE_BACKEND_URL` and `withCredentials: true` for cross-origin cookie management.
- **CALLED BY**: All frontend API calls (AuthContext, ComposeModal, Scheduled, Sent, Search).
- **CALLS**: `axios`.
- **RELATED TECHNOLOGY**: Axios.

---

### `frontend/src/context/AuthContext.tsx`
- **PURPOSE**: React Context providing global user state (`user`, `loading`), session verification (`checkAuth`), and logout handling (`logout`).
- **CALLED BY**: `App.tsx`, all pages and components requiring auth.
- **CALLS**: `api/client.ts`.
- **RELATED TECHNOLOGY**: React Context API.

---

### `frontend/src/context/ThemeContext.tsx`
- **PURPOSE**: React Context managing Dark and Light theme state, applying the `dark` CSS class to `document.documentElement`, and persisting preference in `localStorage`.
- **CALLED BY**: `App.tsx`, `ThemeToggle.tsx`.
- **CALLS**: `localStorage`.
- **RELATED TECHNOLOGY**: React Context API, Tailwind CSS Dark Mode.

---

### `frontend/src/components/ThemeToggle.tsx`
- **PURPOSE**: Smooth interactive button to toggle between Light and Dark mode.
- **CALLED BY**: `Landing.tsx`, `Login.tsx`, `Dashboard/Layout.tsx`.
- **CALLS**: `context/ThemeContext.tsx`.
- **RELATED TECHNOLOGY**: Lucide React (`Sun`, `Moon`).

---

### `frontend/src/components/UI.tsx`
- **PURPOSE**: Reusable UI component library containing standard components: `Button`, `Card`, `Badge`, `Loading`, `Modal`, `EmptyState`, and responsive table wrappers.
- **CALLED BY**: All pages in the frontend.
- **CALLS**: Lucide React.
- **RELATED TECHNOLOGY**: Tailwind CSS.

---

## 8. Test Suites

### `backend/tests/worker.test.ts`
- **PURPOSE**: Comprehensive Jest test suite testing the BullMQ worker processor logic.
- **TEST CASES**:
  - Atomic email claiming (`scheduled` $\rightarrow$ `processing`).
  - Idempotent skipping of already sent emails.
  - Job delay on minimum inter-send interval violation.
  - Hourly rate limiting detection, Slack alert trigger, and auto-rescheduling.
  - Successful SMTP send and database state update.
  - Error escalation on SMTP failure for BullMQ retry.
- **RELATED TECHNOLOGY**: Jest, ts-jest.

---

### `backend/tests/slack.test.ts`
- **PURPOSE**: Unit test suite verifying Slack OAuth rate-limit alert notifications and 1-hour Redis deduplication logic.
- **TEST CASES**:
  - First-time hourly trigger dispatches Slack DM.
  - Subsequent rate limits in the same hour are deduplicated via Redis `SETNX`.
  - Silent success when Slack is not connected.
- **RELATED TECHNOLOGY**: Jest, ts-jest.
