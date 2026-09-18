# ReachInbox — Email Campaign Automation Platform

A high-throughput, distributed full-stack email campaign orchestration platform engineered with Node.js, Express, TypeScript, React, BullMQ, Redis, PostgreSQL, and Elasticsearch. Designed for reliable, high-volume outbound email scheduling with atomic idempotency, sliding-window rate limiting, anti-burst delay coordination, Elasticsearch full-text search, and real-time Slack alerting.

---

## Overview

**ReachInbox** is a full-stack email campaign automation platform for creating, scheduling, processing, tracking, and searching email campaigns with persistent background processing, rate limiting, concurrency control, and third-party integrations.

Modern cold outreach and transactional email workflows require strict deliverability protection, anti-burst pacing, and resilience against server crashes. ReachInbox solves these challenges by combining:
- A non-blocking **delayed job queue architecture** powered by BullMQ and Redis (avoiding inflexible cron jobs).
- Distributed **rate limiting** (hourly sending quotas) and **inter-email delay coordination** across concurrent workers using Redis Lua scripts.
- **Atomic state claiming** (`scheduled` $\rightarrow$ `processing` $\rightarrow$ `sent`) in PostgreSQL to guarantee zero duplicate sends under worker failures or race conditions.
- **Elasticsearch indexing** for sub-millisecond full-text search over email subjects, recipients, and message bodies with automatic PostgreSQL fallback.
- **Third-party integrations** including Google OAuth 2.0 authentication and Slack OAuth v2 for instant, deduplicated rate-limit notifications.

---

## Key Features

### Authentication
- **Google OAuth 2.0**: Secure authorization-code exchange with encrypted HTTP-only session cookies and reverse-proxy header trust (`trust proxy: 1`).
- **Session Management**: Persistent session state with seamless user profile hydration and logout handling.

### Campaign Management
- **Campaign Creation**: Intuitive composer interface supporting custom subject lines, multi-line email bodies, and configurable execution parameters.
- **Bulk CSV Recipient Ingestion**: Drag-and-drop CSV parser powered by PapaParse with automatic validation, whitespace trimming, and duplicate deduplication.
- **Flexible Scheduling**: Immediate batch dispatch or future date/time scheduling.
- **Granular Pacing Controls**: Configurable inter-email delays (`delayBetweenEmails` in seconds) and hourly recipient quotas (`hourlyLimit` per sender).

### Background Processing
- **No-Cron Delayed Queuing**: Native BullMQ delayed jobs backed by Redis sorted sets (`zset`) with microsecond scheduling precision.
- **Worker Concurrency**: Multi-threaded worker execution with configurable concurrency (`WORKER_CONCURRENCY=5`).
- **Automatic Retries & Exponential Backoff**: 3-stage exponential backoff (`5s`, `25s`, `125s`) on transient network or SMTP failures.

### Persistence & Data Integrity
- **PostgreSQL Database**: Relational storage modeled with Prisma 7 and `@prisma/adapter-pg` driver adapter.
- **Atomic Idempotency**: Concurrency-safe SQL row claims preventing duplicate sends across worker processes or queue redelivery.

### Search & Retrieval
- **Elasticsearch 8**: Asynchronous document indexing for high-speed fuzzy search across recipient emails, subjects, and email bodies.
- **PostgreSQL Fallback**: Transparent failover to SQL case-insensitive `ILIKE` queries if Elasticsearch is unreachable or degraded.

### Integrations
- **Slack OAuth v2**: Seamless workspace connection storing user access tokens for notifications.
- **Deduplicated Slack Alerts**: Instant Slack DM notifications sent to the campaign owner when hourly rate limits are reached, deduplicated with a 1-hour Redis TTL key (`slack-notified:{userId}:{hour}`).
- **Resilient SMTP Delivery**: 3-tier delivery engine utilizing configured SMTP credentials, dynamic Ethereal test accounts, and simulated delivery fallback for test environments.

### Dashboard & UI
- **Scheduled Queue Explorer**: Live dashboard displaying pending scheduled emails with real-time countdowns and parameters.
- **Sent History View**: Delivery logs with timestamps, message IDs, status indicators, and Ethereal preview links.
- **Full-Text Search Interface**: Instant search across all processed outbound emails.
- **Theme Switcher**: Complete Dark and Light mode support with persistent state.
- **Responsive Layout**: Mobile-first design optimized across mobile (320px+), tablet, and desktop viewports.

---

## Architecture

```mermaid
graph TD
    subgraph Client Layer
        Browser[React 19 + Vite Frontend]
    end

    subgraph API & Gateway Layer
        API[Express.js TypeScript Backend]
        Session[Cookie-Session Store]
    end

    subgraph Data & Queue Layer
        Postgres[(PostgreSQL 15 + Prisma 7)]
        Redis[(Redis 7 - Queue & Rate Limits)]
        ES[(Elasticsearch 8.11)]
    end

    subgraph Worker & Background Layer
        Worker[BullMQ Worker Pool]
    end

    subgraph External Services
        GoogleOAuth[Google OAuth 2.0 API]
        SlackAPI[Slack Web API]
        SMTP[SMTP Server / Ethereal]
    end

    Browser -->|HTTP REST / Cookies| API
    API -->|Authenticate| GoogleOAuth
    API -->|Session Auth| Session
    API -->|CRUD & Campaign State| Postgres
    API -->|Enqueue Delayed Jobs| Redis
    API -->|Search Query / Fallback| ES
    API -.->|Search Fallback| Postgres

    Worker -->|Poll & Consume Jobs| Redis
    Worker -->|Atomic Status Claim| Postgres
    Worker -->|Check & Increment Limits / Delay Lua| Redis
    Worker -->|Send Email| SMTP
    Worker -->|Rate Limit Alert| SlackAPI
    Worker -->|Update Status to Sent/Failed| Postgres
    Worker -->|Index Message| ES
```

---

## Email Scheduling Flow

1. **User Submission**: The user uploads a CSV of recipients or enters email details, specifies a scheduled start time, inter-email delay (e.g., 2s), and hourly sending cap (e.g., 100/hr) via the React dashboard.
2. **Persistence in PostgreSQL**: The Express controller (`POST /api/emails/schedule`) parses input with Zod, creates a `Campaign` record, and inserts `Email` rows in `scheduled` state within PostgreSQL.
3. **Queue Enrollment**: For each created email, a delayed job is pushed to BullMQ (`emailQueue`) with a delay calculated as `Math.max(0, scheduledAt.getTime() - Date.now())` and a unique `jobId: email-${email.id}`.
4. **Immediate Non-Blocking Response**: The HTTP endpoint responds with `201 Created` and the campaign summary without blocking the user.
5. **Worker Execution**: When the delay elapses, the BullMQ worker picks up the job.
6. **Atomic Claim (Idempotency)**: The worker executes `prisma.email.updateMany({ where: { id: emailId, status: 'scheduled' }, data: { status: 'processing', attempts: { increment: 1 } } })`. If `count === 0`, the job is skipped to prevent duplicate delivery.
7. **Minimum Delay Enforcement**: A Redis Lua script verifies `last-send:{userId}`. If the elapsed time since the last dispatch is less than `delayBetweenEmails`, the job is delayed by the remaining duration via `job.moveToDelayed(...)` and status reverts to `scheduled`.
8. **Hourly Rate Limit Check**: The worker increments an atomic Redis key `rate-limit:{userId}:{YYYY-MM-DDTHH}`. If the count exceeds `hourlyLimit`:
   - The job is rescheduled to the start of the next hour window (`nextHour.setMinutes(0, 0, 0)`).
   - A rate-limit alert is dispatched to the user's Slack workspace (deduplicated via Redis).
   - Status reverts to `scheduled` and a `DelayedError` is thrown.
9. **SMTP Dispatch**: If all checks pass, the email is sent via Nodemailer.
10. **Final State & Indexing**: The database record is updated to `status: 'sent'`, `sentAt: new Date()`, and `messageId`, followed by asynchronous indexing into Elasticsearch.

---

## Persistence and Restart Recovery

### How Queue State and Data are Persisted
- **Redis Sorted Sets**: BullMQ persists all waiting, active, delayed, and failed jobs directly in Redis memory and disk via Append-Only File (`appendonly yes`).
- **PostgreSQL Relational Storage**: All campaign metadata, recipient lists, execution status (`scheduled`, `processing`, `sent`, `failed`), and attempt counters are durably stored in PostgreSQL.

### Server / Worker Restart Behavior
- **Zero Job Loss**: If the backend process or background worker crashes or restarts, BullMQ reconnects to Redis and resumes scheduled jobs at their exact intended timestamp.
- **In-Flight Recovery**: If a worker crashes mid-execution while processing an email:
  - BullMQ detects the abandoned lock via Redis stalls and re-delivers the job.
  - The worker inspects the database status. If the email was never marked `sent`, it safely re-attempts delivery while incrementing the `attempts` counter.
- **Scheduled Time In The Past**: If a server was offline during an email's scheduled time, BullMQ identifies `delay <= 0` upon startup and immediately executes the overdue job.

---

## Rate Limiting

### Distributed Hourly Quotas
Rate limiting is tracked using atomic Redis counters segmented by sender and hour window:
- **Key Format**: `rate-limit:{userId}:{YYYY-MM-DDTHH}` (e.g., `rate-limit:usr-123:2026-08-29T14`).
- **Lifecycle**: On the first increment within an hour, a 1-hour TTL (`EXPIRE key 3600`) is set.
- **Graceful Rescheduling**: When `currentCount > hourlyLimit`, the job is **not dropped or marked failed**. It is shifted to the next hour window using `job.moveToDelayed(nextHourTimestamp)`.

### Minimum Delay Anti-Burst Coordination
To prevent spam filter flags from simultaneous burst sends, the system enforces a configurable gap between consecutive emails:
- **Redis Atomic Lua Script**:
  ```lua
  local lastSend = redis.call("GET", KEYS[1])
  if not lastSend then
    redis.call("SET", KEYS[1], ARGV[1])
    return 1
  end
  local diff = tonumber(ARGV[1]) - tonumber(lastSend)
  if diff >= tonumber(ARGV[2]) then
    redis.call("SET", KEYS[1], ARGV[1])
    return 1
  else
    return tonumber(lastSend) + tonumber(ARGV[2])
  end
  ```
- If the delay requirement is not met, the Lua script returns the exact timestamp when the worker may proceed, and BullMQ delays the job accordingly.

---

## Worker Concurrency

- **Configuration**: Worker concurrency is configured via `WORKER_CONCURRENCY` (default: `5`).
- **Parallel Processing**: A single worker process can execute 5 emails concurrently while respecting individual per-user rate limits and minimum delay locks in Redis.
- **Multi-Instance Ready**: Multiple worker instances can run across separate containers or dynos; Redis Lua scripts and PostgreSQL atomic updates ensure synchronized rate limiting and prevent race conditions.

---

## Elasticsearch

### Indexing & Schema
Sent emails are indexed into the `emails` index upon successful delivery:
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "campaignId": { "type": "keyword" },
      "recipient": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "subject": { "type": "text" },
      "body": { "type": "text" },
      "status": { "type": "keyword" },
      "scheduledAt": { "type": "date" },
      "sentAt": { "type": "date" }
    }
  }
}
```

### Fuzzy Search & Fallback
- **Elasticsearch Query**: Uses a `multi_match` query with `fuzziness: "AUTO"` across `recipient`, `subject`, and `body`.
- **Fault-Tolerant PostgreSQL Fallback**: If Elasticsearch is unavailable, the API controller automatically executes a PostgreSQL query using `ILIKE / contains`:
  ```typescript
  prisma.email.findMany({
    where: {
      campaign: { userId },
      OR: [
        { recipient: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } }
      ]
    },
    take: 50
  })
  ```

---

## Authentication

- **Protocol**: Google OAuth 2.0 Authorization Code Flow.
- **Workflow**:
  1. Frontend redirects user to `/api/auth/google`.
  2. Backend redirects to Google Accounts consent screen.
  3. Google redirects back to `/api/auth/google/callback` with authorization code.
  4. Backend exchanges code for ID/access tokens, retrieves user profile, and creates or updates the `User` record in PostgreSQL.
  5. An encrypted HTTP-only session cookie (`session`) is established.
  6. Backend redirects the browser to `/dashboard`.
- **Reverse Proxy Support**: Configured with `app.set('trust proxy', 1)` to handle HTTPS cookies correctly on platforms like Render and Cloudflare.

---

## Slack Integration

- **OAuth Authorization**: Users connect their Slack workspace via `/api/slack/connect` using the `chat:write` permission scope.
- **Token Storage**: The access token is linked to the user record in PostgreSQL (`SlackConnection`).
- **Rate Limit Trigger**: When a campaign reaches its hourly limit, `sendRateLimitNotification()` is triggered.
- **1-Hour Deduplication**: To avoid spamming Slack channels, notifications are guarded by Redis:
  ```typescript
  const dedupKey = `slack-notified:${userId}:${currentHour}`;
  const isFirstNotification = await redis.setnx(dedupKey, '1');
  if (isFirstNotification) {
    await redis.expire(dedupKey, 3600);
    // Dispatch Slack DM via Web API
  }
  ```

---

## Technology Stack

| Layer | Technologies | Verified Versions |
|-------|-------------|-------------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, PapaParse, Lucide React | React 19, Vite 8.2, Tailwind 3.4, TS 6.0 |
| **Backend** | Node.js, Express.js, TypeScript, Zod, Helmet, Cors, cookie-session | Express 5.2, Node 20+ LTS, TS 5.9 |
| **Database & ORM** | PostgreSQL 15, Prisma ORM, `@prisma/adapter-pg` | Prisma 7.10, pg 8.23 |
| **Queue & Cache** | Redis 7, BullMQ, ioredis | BullMQ 6.3, ioredis 6.0 |
| **Search Engine** | Elasticsearch 8, `@elastic/elasticsearch` | Elasticsearch 8.11 / Client 8.19 |
| **Email & Alerting** | Nodemailer, Slack Web API, Google OAuth 2.0 | Nodemailer 9.0 |
| **Infrastructure** | Docker, Docker Compose | PostgreSQL 15, Redis 7, ES 8.11 |

---

## Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [npm](https://www.npmjs.com/)

### 1. Clone & Setup Environment
```bash
git clone https://github.com/GOWTHAM-2709/reachinbox-email-scheduler.git
cd reachinbox-email-scheduler
cp .env.example .env
cp .env.example backend/.env
```

### 2. Start Infrastructure Containers
```bash
docker compose up -d
```
*Starts PostgreSQL (5432), Redis (6379), and Elasticsearch (9200).*

### 3. Initialize Database
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 4. Run Backend Development Server
```bash
npm run dev
```
*Server starts on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

### 5. Run BullMQ Background Worker (Optional in local standalone mode)
```bash
# In backend directory
npm run worker
```

### 6. Run Frontend Application
```bash
cd ../frontend
npm install
npm run dev
```
*Application available at `http://localhost:5173`.*

---

## Environment Variables

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Frontend origin URL | `http://localhost:5173` |
| `BACKEND_URL` | Backend base URL | `http://localhost:5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/reachinbox_db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `ELASTICSEARCH_URL` | Elasticsearch endpoint | `http://localhost:9200` |
| `SESSION_SECRET` | Secret key for signing session cookies | `your-secret-key` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your-google-client-secret` |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | `http://localhost:5000/api/auth/google/callback` |
| `SLACK_CLIENT_ID` | Slack App Client ID | `your-slack-client-id` |
| `SLACK_CLIENT_SECRET` | Slack App Client Secret | `your-slack-client-secret` |
| `SLACK_REDIRECT_URI` | Slack OAuth callback URL | `http://localhost:5000/api/slack/callback` |
| `SMTP_HOST` | SMTP server hostname | `smtp.ethereal.email` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your-smtp-user` |
| `SMTP_PASS` | SMTP password | `your-smtp-pass` |
| `MAX_EMAILS_PER_HOUR` | Hourly rate limit per user | `100` |
| `MIN_DELAY_BETWEEN_EMAILS` | Minimum delay between sends (seconds) | `2` |
| `WORKER_CONCURRENCY` | Worker thread concurrency | `5` |

---

## Testing

The project includes unit and integration tests using Jest covering the core queuing, rate limiting, and alerting pipeline:

```bash
cd backend
npm test
```

### Verified Test Results (9/9 Passed)
- `tests/worker.test.ts`:
  - Atomic email claiming (`scheduled` $\rightarrow$ `processing`).
  - Idempotency check skipping already sent emails.
  - Delay enforcement when minimum inter-send interval is not met.
  - Hourly rate limit threshold detection with Slack notification trigger and automatic job rescheduling.
  - Successful SMTP transmission and database status update.
  - SMTP failure handling and error escalation for BullMQ retry.
- `tests/slack.test.ts`:
  - Slack rate-limit alert dispatch on initial hourly limit trigger.
  - 1-hour Redis key deduplication skipping duplicate alerts.
  - Graceful handling when Slack is not connected.

---

## Docker

The included `docker-compose.yml` provides a one-command development environment:
- **`postgres`**: PostgreSQL 15 Alpine container with persistent volume `postgres_data` and healthcheck (`pg_isready`).
- **`redis`**: Redis 7 Alpine container with persistent volume `redis_data` and AOF persistence enabled (`--appendonly yes`).
- **`elasticsearch`**: Elasticsearch 8.11.1 container configured for single-node development with memory limits (`ES_JAVA_OPTS=-Xms512m -Xmx512m`).

---

## Deployment

The application is architected for production deployment across modern cloud platforms:
- **Backend API & Worker**: Deployed as a Node.js Web Service on **Render**. The BullMQ worker is imported directly in `src/index.ts` allowing unified API and worker execution on a single service.
- **Frontend**: Deployed as a Static Site on **Render** (or Vercel) built using `npm run build` (`vite build`).
- **Database**: Managed PostgreSQL instance on **Render Database**.
- **Redis**: Managed Redis instance (Upstash or Redis Cloud) providing low-latency queue persistence.
- **Elasticsearch**: Elastic Cloud deployment or self-hosted Elasticsearch cluster.

---

## Project Structure

```
reachinbox-email-scheduler/
├── .env.example                  # Environment configuration template
├── docker-compose.yml            # Local PostgreSQL, Redis & Elasticsearch setup
├── README.md                     # Project documentation
├── PROJECT_RESUME_NOTES.md       # Portfolio & resume summary
├── docs/
│   ├── TECHNICAL_INTERVIEW_GUIDE.md  # Comprehensive technical deep-dive & Q&A
│   └── CODE_MAP.md                   # Source file architecture map
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma.config.ts
│   ├── prisma/
│   │   └── schema.prisma         # PostgreSQL models (User, Campaign, Email, SlackConnection)
│   ├── src/
│   │   ├── app.ts                # Express application configuration & middleware
│   │   ├── index.ts              # Server entry point & worker bootstrap
│   │   ├── config/
│   │   │   ├── db.ts             # Prisma client instance with pg adapter
│   │   │   ├── elasticsearch.ts  # Elasticsearch client & index setup
│   │   │   ├── env.ts            # Environment variable validation
│   │   │   └── redis.ts          # ioredis client instance
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # Google OAuth handlers
│   │   │   ├── email.controller.ts  # Campaign scheduling & search handlers
│   │   │   └── slack.controller.ts  # Slack OAuth connection handlers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # Session authentication guard
│   │   │   └── error.middleware.ts  # Global error handler
│   │   ├── queues/
│   │   │   ├── email.queue.ts       # BullMQ queue definition & job creator
│   │   │   └── email.worker.ts      # BullMQ worker processor & rate limiting
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # /api/auth endpoints
│   │   │   ├── email.routes.ts      # /api/emails endpoints
│   │   │   ├── queue.routes.ts      # /admin/queues (Bull Board)
│   │   │   └── slack.routes.ts      # /api/slack endpoints
│   │   └── services/
│   │       ├── auth.service.ts          # Google token exchange & user lookup
│   │       ├── elasticsearch.service.ts # Document indexing & search
│   │       ├── email.service.ts         # Nodemailer 3-tier delivery cascade
│   │       └── slack.service.ts         # Slack alert sender with Redis dedup
│   └── tests/
│       ├── slack.test.ts         # Slack notification tests
│       └── worker.test.ts        # Worker idempotency & rate limit tests
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx               # Route definitions
        ├── main.tsx              # React DOM entry point
        ├── index.css             # Tailwind base styles & theme variables
        ├── api/
        │   └── client.ts         # Axios client with credentials
        ├── components/
        │   ├── ThemeToggle.tsx   # Dark/Light mode switcher
        │   └── UI.tsx            # Reusable UI components (Button, Modal, Table, etc.)
        ├── context/
        │   ├── AuthContext.tsx   # User authentication provider
        │   └── ThemeContext.tsx  # Theme provider
        └── pages/
            ├── Landing.tsx       # Marketing & architecture overview page
            ├── Login.tsx         # Sign-in page
            └── Dashboard/
                ├── Layout.tsx        # Dashboard shell & navigation
                ├── ComposeModal.tsx  # Campaign creator & CSV upload modal
                ├── Scheduled.tsx     # Pending email queue table
                ├── Sent.tsx          # Delivered email history table
                └── Search.tsx        # Elasticsearch search view
```

---

## Design Decisions / Trade-offs

1. **No-Cron Queuing vs. Polling Interval**:
   - *Decision*: Avoided `node-cron` and database polling loops in favor of BullMQ native delayed jobs (`zset`).
   - *Rationale*: Database polling introduces latency spikes, unnecessary SQL read load, and polling race conditions. BullMQ uses Redis timers to trigger jobs with sub-millisecond accuracy.

2. **Redis Lua Scripting for Delay Enforcement**:
   - *Decision*: Implemented inter-email delay tracking with an atomic Lua script (`EVAL`).
   - *Rationale*: Multi-worker setups could encounter race conditions if checking and updating `last-send` across separate commands. The Lua script executes atomically within Redis memory.

3. **Atomic SQL State Transition for Idempotency**:
   - *Decision*: Used `UPDATE "Email" SET status = 'processing' WHERE id = $id AND status = 'scheduled'` before dispatching emails.
   - *Rationale*: Prevents duplicate sends across concurrent workers or upon BullMQ lock timeouts. If the atomic update returns 0 affected rows, the worker exits immediately.

4. **3-Tier Resilient SMTP Strategy**:
   - *Decision*: Structured Nodemailer with configured SMTP $\rightarrow$ dynamic Ethereal test account $\rightarrow$ simulated delivery fallback.
   - *Rationale*: Ensures zero crashes or stuck queues in development, staging, or automated evaluation environments when external SMTP providers face network rate limits.

5. **Elasticsearch with Seamless PostgreSQL Fallback**:
   - *Decision*: Elasticsearch handles fuzzy full-text queries; if unavailable, the controller silently fails over to PostgreSQL `ILIKE`.
   - *Rationale*: Eliminates single points of failure in search while retaining enterprise search performance during normal operation.

---

## Future Improvements

*(Planned roadmap items)*
- **Campaign Analytics Dashboard**: Real-time open rate, click rate, and bounce tracking via tracking pixels and signed redirect URLs.
- **Visual Email Template Builder**: Drag-and-drop WYSIWYG template editor with variable placeholders (`{{firstName}}`, `{{company}}`).
- **Campaign State Controls**: One-click pause, resume, and cancellation for active bulk campaigns.
- **Multi-Tenant Team Workspaces**: Role-based access control (Admin, Member, Viewer) with workspace-level sender pooling.
- **Webhook Subscriptions**: Outbound webhooks on email delivery status changes for CRM integrations.
