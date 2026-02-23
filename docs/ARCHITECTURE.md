# Finance App — Architecture

## 1. Purpose

Finance App is a modular fintech platform designed to support:
- Individual savings/wallet flows
- Group savings (tontine) flows
- Full transaction tracking and auditability
- Commission-based business model
- Future integrations (mobile money, cards, exchange, etc.)

Core principles:
- **Backend-first**
- **Security-first**
- **Modular design**
- **Traceability by default**
- **Step-by-step delivery (commit-by-commit)**

---

## 2. System Overview

### 2.1 High-level architecture

- **Client(s)**: (future) Angular frontend, mobile, API consumers
- **API**: NestJS (modular monolith for MVP)
- **Database**: PostgreSQL (single source of truth)
- **ORM**: Prisma v7 (pg adapter)
- **Auth**: JWT Access + Refresh rotation

MVP target: a strong, secure backend foundation before building the UI.

---

## 3. Repository Structure


finance-app/
├── infra/
│ ├── docker-compose.yml
│ └── .env (ignored)
│
├── backend/
│ ├── src/
│ │ ├── prisma/ # PrismaService + PrismaModule
│ │ ├── users/ # User persistence (Prisma calls)
│ │ ├── auth/ # JWT auth + refresh rotation
│ │ └── app.module.ts
│ │
│ ├── prisma/
│ │ ├── schema.prisma
│ │ └── migrations/
│ ├── prisma.config.ts
│ └── .env (ignored)
│
└── docs/
└── ARCHITECTURE.md



---

## 4. Modules & Responsibilities (Backend)

### 4.1 Prisma Module
**Goal:** provide a single Prisma client instance to the whole app.

- `PrismaService`: PrismaClient (Prisma 7) using **pg adapter**
- `PrismaModule`: marked as global to avoid repeated imports

**Rules:**
- No business logic inside PrismaService
- Only DB connection lifecycle management

---

### 4.2 Users Module
**Goal:** user persistence API for other modules.

Responsibilities:
- `findByEmail(email)`
- `findById(id)`
- `create(email, passwordHash)`
- `updateRefreshTokenHash(userId, hash|null)`

**Rules:**
- UsersService contains direct DB calls
- AuthService never directly touches Prisma

---

### 4.3 Auth Module
**Goal:** authentication + token lifecycle.

Endpoints:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh` (MVP currently)
- `POST /auth/logout`

Responsibilities:
- Hash password (bcrypt)
- Issue access token (short TTL)
- Issue refresh token (long TTL)
- Store refresh token **hash** in DB
- Rotate refresh token on refresh/login

**Security model:**
- Access token is stateless
- Refresh token is stateful (validated against DB hash)

---

## 5. Data Model (Current)

### 5.1 User

Fields:
- `id` (UUID)
- `email` (unique)
- `password` (bcrypt hash)
- `refreshTokenHash` (nullable, bcrypt hash)
- `createdAt`
- `updatedAt`

**Key constraints:**
- Unique email
- refreshTokenHash nullable for logout

---

## 6. Authentication Flow

### 6.1 Register Flow
1. Client sends `email + password`
2. Backend checks email uniqueness
3. Password is hashed and stored
4. Backend issues:
   - Access token (15 min)
   - Refresh token (7 days)
5. Refresh token is hashed and stored in `refreshTokenHash`

Output: `{ accessToken, refreshToken }`

---

### 6.2 Login Flow
1. Client sends `email + password`
2. Backend validates password hash
3. Backend issues new tokens
4. Refresh token hash is rotated and saved

Output: `{ accessToken, refreshToken }`

---

### 6.3 Refresh Flow (Current MVP)
**Current state:** refresh endpoint accepts `userId + refreshToken`.
This works but is not ideal because `userId` should not be trusted.

**Target improvement:**
- Refresh should accept only `refreshToken`
- Backend verifies token signature, extracts `sub` (userId)
- Backend compares token with stored refreshTokenHash

---

### 6.4 Logout Flow
1. Backend sets `refreshTokenHash = null`
2. Any refresh attempt becomes invalid

---

## 7. Runtime Environment

### 7.1 Database
- PostgreSQL 16 running in Docker
- Local port: `5432`
- Persistent volume enabled

### 7.2 Backend
- NestJS running in dev mode
- Uses `.env` (ignored by git)

---

## 8. Roadmap (Architecture-driven)

### Phase 1 — Foundation (current)
- ✅ PostgreSQL Docker
- ✅ Prisma + migrations
- ✅ Auth (JWT + refresh rotation)
- ⏳ JWT Guard + protected routes
- ⏳ `/me` endpoint

### Phase 2 — Savings / Wallet
- Wallet model
- Transaction model
- Deposit/withdraw flows
- Balance calculation rules

### Phase 3 — Tontine MVP
- Group
- Membership
- Contribution
- Manual payout
- Audit trail

---

## 9. Non-goals (MVP)
- Mobile money integration
- Payment cards
- Ledger double-entry system (planned later)
- Complex compliance (KYC/AML)

---

## 10. Design Rules (Project Discipline)

- **1 step = 1 commit**
- **No massive code generation**
- Use Windsurf only for:
  - scaffolding (module/controller/service)
  - repetitive boilerplate
  - mechanical refactors
- Security and financial logic remain human-reviewed



