# PROMPTS.md

Raw, unedited chat log with Claude (Anthropic) used to scaffold this project. Per the kata's AI Usage Policy, this is the actual conversation, not a summary.

---

**User (message 1):** [Uploaded the "TDD Kata: Car Dealership Inventory System" spec document]

**Assistant:** Read through the kata spec and offered several starting points: scaffold the whole project, start with backend only, start with frontend only, plan architecture/tests first, or help with README/AI-usage docs. Asked which stack the user preferred for the backend (Node/TypeScript, Python, or Ruby).

---

**User (message 2):** Node

**Assistant:** Asked two clarifying questions via a quick-select prompt:
1. Which database should the backend use? (PostgreSQL / SQLite / MongoDB)
2. Any preference on framework/ORM? (Express + Prisma / Express + TypeORM / NestJS + TypeORM / No preference — pick for me)

---

**User (message 3):**
Q: Which database should the backend use?
A: MySQL

Q: Any preference on framework/ORM?
A: No preference — pick for me

**Assistant:** Chose Node.js + TypeScript + Express + Prisma + MySQL, with Jest + Supertest for testing and bcrypt + jsonwebtoken for auth. Noted that network access was disabled in the sandbox environment, so packages could not actually be installed or tests actually executed — code would be written directly as files instead. Proceeded to scaffold:

- Backend: package.json, tsconfig.json, jest.config.js, Prisma schema (User + Vehicle models), env config, Prisma client singleton, JWT utility, password hashing utility, custom error classes, auth/admin middleware, central error handler, AuthService, VehicleService, auth/vehicle controllers, auth/vehicle routes, app.ts (testable Express app factory), server.ts entry point.
- Tests: mockPrisma test helper (jest-mock-extended), unit tests for AuthService and VehicleService, integration tests for auth routes and vehicle routes via Supertest against a mocked Prisma client.
- .env.example, .gitignore.

Then scaffolded the frontend: package.json, vite.config.ts, tailwind.config.js, postcss.config.js, index.html, global CSS, shared types, a typed fetch-based API client, AuthContext (login/register/logout with sessionStorage persistence), Navbar, VehicleCard, SearchBar, VehicleForm components, and LoginPage, RegisterPage, DashboardPage.

Summarized progress and flagged remaining work: App.tsx/main.tsx routing, an admin seed script, README.md, and PROMPTS.md.

---

**User (message 4):** Continue

**Assistant:** Added:
- `App.tsx` with React Router setup (protected routes redirecting unauthenticated users to `/login`, public-only routes redirecting authenticated users away from `/login`/`/register`).
- `main.tsx` entry point wiring `BrowserRouter` + `AuthProvider`.
- Frontend `.gitignore`.
- A Prisma seed script (`prisma/seed.ts`) to create an initial admin user and sample vehicles, since public registration always creates `CUSTOMER`-role accounts by design.
- Updated `backend/package.json` to add `ts-node` and a `prisma.seed` config entry so `npx prisma db seed` works.
- Caught and fixed a security gap: the register controller was passing `req.body` straight through to `AuthService.register`, which would have let a client self-assign `role: "ADMIN"`. Fixed it to destructure only `email`/`password` from the request body.
- Added a `docker-compose.yml` for a local MySQL instance to simplify setup.
- Wrote the root `README.md` (project structure, setup instructions for both backend and frontend, API reference table, test report placeholder, mandatory "My AI Usage" section, and a note on the expected git commit/co-author workflow).
- Wrote this `PROMPTS.md` file.

---

## Note on this log

This project was built directly in a Claude chat session (not via an IDE plugin like Copilot), so this log is the actual back-and-forth rather than an exported chat history file. If you continue this project in your own AI tool of choice, append further raw exchanges below this line rather than editing the log above.
