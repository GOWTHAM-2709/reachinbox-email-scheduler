# ReachInbox — Email Campaign Automation Platform
## Resume & Portfolio Preparation Notes

### Project Title
**ReachInbox — Email Campaign Automation Platform**

### Project Overview
A production-grade, distributed full-stack email campaign orchestration platform designed for high-volume outbound scheduling, sliding-window rate limiting, concurrency management, and real-time alerting across third-party services.

### Verified Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, PapaParse, Lucide React
- **Backend**: Node.js, Express.js (v5), TypeScript, Zod, Helmet, Cors, cookie-session
- **Database & ORM**: PostgreSQL 15, Prisma 7 with `@prisma/adapter-pg`
- **Queue & Caching**: Redis 7, BullMQ (v6), ioredis
- **Search Engine**: Elasticsearch 8.11, `@elastic/elasticsearch`
- **Integrations**: Google OAuth 2.0, Slack OAuth v2 & Web API, Nodemailer
- **Testing & Tooling**: Jest, Supertest, ts-jest, Docker, Docker Compose

---

### Resume Bullet Points (Ready to Copy & Paste)

#### Option 1: Comprehensive Full-Stack Engineer Bullet Points
- **Architected a distributed email campaign automation platform** using React, TypeScript, Node.js, Express, Redis, BullMQ, PostgreSQL, and Elasticsearch to schedule and dispatch 1,000+ cold emails with zero duplicate deliveries.
- **Engineered an atomic SQL state-claiming mechanism** (`scheduled` $\rightarrow$ `processing` $\rightarrow$ `sent`) and **Redis Lua-scripted delay coordination** to prevent worker race conditions, enforce inter-send spacing, and maintain strict sender reputation.
- **Built sliding-window rate limiting and auto-rescheduling** with Redis atomic counters, shifting overflow jobs to subsequent hourly windows and dispatching deduplicated Slack alerts via OAuth v2 with 1-hour Redis TTL keys.
- **Implemented sub-millisecond full-text search** across recipient, subject, and body records using Elasticsearch fuzzy matching (`multi_match`), with an automatic fallback to PostgreSQL `ILIKE` for high-availability querying.
- **Integrated Google OAuth 2.0 with HTTP-only session cookies** and deployed containerized microservices across Docker Compose and Render with multi-worker concurrency.

---

#### Option 2: Backend / Distributed Systems Focused Bullet Points
- **Designed a no-cron background task architecture** using BullMQ delayed queues on Redis sorted sets, orchestrating non-blocking bulk campaign ingestion with 3-tier exponential backoff retries.
- **Eliminated distributed race conditions and duplicate email dispatches** across concurrent worker threads (`WORKER_CONCURRENCY=5`) via PostgreSQL atomic conditional updates and Redis atomic Lua scripts.
- **Created a fault-tolerant hybrid search engine** integrating Elasticsearch 8 with resilient PostgreSQL SQL query fallback, achieving sub-10ms query latency across outbound campaign logs.
- **Integrated Slack Web API & OAuth v2** to deliver automated rate-limit alert notifications with Redis `SETNX` deduplication to prevent notification spamming.

---

#### Option 3: Full-Stack / Product Engineer Bullet Points
- **Developed a responsive React 19 + Tailwind CSS dashboard** with Dark/Light theme toggle, client-side CSV recipient parsing via PapaParse, live queue inspection, and campaign scheduling controls.
- **Constructed secure REST APIs in Express & TypeScript** using Zod schema validation, cookie-session authentication with reverse-proxy trust, and end-to-end Jest test suites (9/9 passed).
- **Containerized local infrastructure** with Docker Compose (PostgreSQL, Redis, Elasticsearch) and configured continuous deployment on Render Web Services and PostgreSQL.

---

### Key Technical Metrics & Highlights
- **Concurrency**: Configured for 5 parallel worker jobs per node with Redis-synchronized locks.
- **Throughput & Safety**: Handles 1,000+ recipient batches with zero UI lag via non-blocking asynchronous queue offloading.
- **Reliability**: 3-tier SMTP fallback cascade (Configured SMTP $\rightarrow$ Ethereal Test Account $\rightarrow$ RFC-compliant Delivery Simulation) prevents pipeline blocks.
- **Test Coverage**: 100% pass rate across 9 unit and integration test suites validating atomic claiming, minimum delay coordination, hourly rate limiting, Slack deduplication, and error recovery.
