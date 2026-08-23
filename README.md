# AutoLot — Car Dealership Inventory System

A full-stack car dealership inventory management system built as a TDD kata. Customers can browse and purchase vehicles; admins can manage the full inventory.

- **Backend:** Node.js, TypeScript, Express, Prisma ORM, MySQL, JWT auth
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Testing:** Jest, Supertest, jest-mock-extended (backend unit + integration tests)

---

## Project structure

```
car-dealership/
├── backend/           # Express + Prisma REST API
│   ├── src/
│   │   ├── config/        # env + Prisma client
│   │   ├── controllers/   # request handlers
│   │   ├── middleware/    # auth, error handling
│   │   ├── routes/        # route definitions
│   │   ├── services/      # business logic (unit-tested in isolation)
│   │   ├── utils/         # jwt, password hashing, error classes
│   │   ├── app.ts         # Express app factory (testable, no side effects)
│   │   └── server.ts      # entry point — starts listening
│   ├── prisma/
│   │   ├── schema.prisma  # User + Vehicle models
│   │   └── seed.ts        # creates an admin user + sample vehicles
│   └── tests/
│       ├── unit/          # AuthService, VehicleService (mocked Prisma)
│       └── integration/   # route-level tests via Supertest
├── frontend/          # React + Tailwind SPA
│   └── src/
│       ├── api/           # typed fetch client
│       ├── context/       # AuthContext (login/register/logout, session persistence)
│       ├── components/    # Navbar, VehicleCard, SearchBar, VehicleForm
│       └── pages/         # LoginPage, RegisterPage, DashboardPage
├── docker-compose.yml # local MySQL for development
├── PROMPTS.md         # raw AI chat logs (see AI Usage Policy)
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js 18+
- MySQL 8+ (or Docker, see below)

### 1. Database

The quickest path is Docker:

```bash
docker compose up -d
```

This starts MySQL on `localhost:3306` with database `car_dealership`, user `dealership` / password `dealership`. If you'd rather use an existing MySQL install, just create a database and update `DATABASE_URL` accordingly.

### 2. Backend setup

```bash
cd backend
cp .env.example .env      # edit DATABASE_URL / JWT_SECRET if needed
npm install
npx prisma migrate dev --name init   # creates tables
npx prisma db seed                   # creates an admin user + sample vehicles
npm run dev                          # starts the API on http://localhost:4000
```

The seed script prints the admin credentials it creates (default `admin@autolot.test` / `AdminPass123` unless overridden via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars). Regular sign-ups via `/api/auth/register` are always created as `CUSTOMER` — there's no way for a client to self-assign the `ADMIN` role, by design.

#### Running backend tests

```bash
cd backend
npm test               # run the full suite
npm run test:coverage  # run with a coverage report
```

Tests are split into:
- `tests/unit/` — `AuthService` and `VehicleService` tested against a fully mocked `PrismaClient` (no real database needed).
- `tests/integration/` — full HTTP request/response cycles through the Express app (via Supertest), also against a mocked Prisma client, covering auth guarding, role-based access (admin-only delete/restock), validation errors, and edge cases like out-of-stock purchases.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev             # starts the SPA on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:4000`, so the backend must be running.

### 4. Using the app

1. Open `http://localhost:5173`.
2. Register a new account (created as a customer), or log in as the seeded admin.
3. Browse vehicles, search/filter by make, model, category, or price range.
4. As a customer: click **Purchase** on any in-stock vehicle (disabled automatically at zero quantity).
5. As an admin: use **+ Add vehicle**, and the **Edit / Restock / Delete** controls on each card.

---

## API reference

| Method | Endpoint                          | Auth        | Description                          |
|--------|------------------------------------|-------------|---------------------------------------|
| POST   | `/api/auth/register`              | Public      | Register a new customer account       |
| POST   | `/api/auth/login`                 | Public      | Log in, returns a JWT                 |
| GET    | `/api/vehicles`                   | Token       | List all vehicles                     |
| GET    | `/api/vehicles/search`            | Token       | Search by make/model/category/price   |
| POST   | `/api/vehicles`                   | Token       | Add a new vehicle                     |
| GET    | `/api/vehicles/:id`                | Token       | Get one vehicle                       |
| PUT    | `/api/vehicles/:id`                | Token       | Update a vehicle                      |
| DELETE | `/api/vehicles/:id`                | Admin       | Delete a vehicle                      |
| POST   | `/api/vehicles/:id/purchase`      | Token       | Purchase (decrements quantity by 1)   |
| POST   | `/api/vehicles/:id/restock`       | Admin       | Restock (`{ "amount": n }`, default 1)|

All protected endpoints expect `Authorization: Bearer <token>`.

---

## Test report

_Run `npm run test:coverage` inside `backend/` and paste the summary table here before submitting, e.g.:_

```
Test Suites: 4 passed, 4 total
Tests:       XX passed, XX total
Coverage:    Statements  XX%  Branches  XX%  Functions  XX%  Lines  XX%
```

## Notes on TDD workflow

The commit history should show a Red→Green→Refactor pattern per the kata's guidelines — for example, committing a failing test for `VehicleService.purchase` rejecting an out-of-stock purchase, then a follow-up commit implementing the guard clause that makes it pass. When committing AI-assisted work, follow the co-author trailer format specified in the kata:

```bash
git commit -m "feat: add out-of-stock guard to VehicleService.purchase

Used Claude to draft the failing test and the guard clause implementation.

Co-authored-by: Claude <noreply@anthropic.com>"
```
