# Citadel

Citadel is a unified HR Management System and Internal Project Management System built for **CollabCircle**.

The platform is intended to give organizations one organized workspace for managing people, teams, work, projects, and internal operations.

## Product vision

Citadel will combine essential HR workflows with internal project delivery in a simple, elegant, and organized experience.

### HR management

- Employee profiles and organization structure
- Departments, teams, roles, and reporting relationships
- Attendance, leave, and holiday management
- Onboarding and offboarding workflows
- Internal announcements and employee records
- Role-based access to sensitive HR information

### Internal project management

- Projects, teams, milestones, and deliverables
- Tasks, statuses, priorities, assignees, and due dates
- Project dashboards and progress tracking
- Comments, activity history, and internal collaboration
- Workload and ownership visibility
- Project-level access control

The feature list will evolve as requirements are finalized.

## Technology stack

| Area | Technology |
| --- | --- |
| Backend | NestJS, TypeScript |
| Frontend | Next.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| UI/UX | Simple, elegant, organized, premium visual language |
| Product | CollabCircle |

## Repository structure

```text
Citadel/
├── backend/       # NestJS API and backend services
├── frontend/      # Next.js web application
├── docs/          # Product, architecture, and API documentation
├── .gitignore
├── LICENSE
└── readme.md
```

## Prerequisites

Install the following before starting development:

- Node.js 20 or later
- npm, pnpm, or another agreed Node.js package manager
- PostgreSQL 15 or later
- Git

Docker is recommended for running PostgreSQL consistently across development environments.

## Getting started

The application packages are being initialized. Once `backend` and `frontend` contain their respective package manifests, use the following workflow from the project root:

```bash
git clone https://github.com/CollabCircle-Official/Citadel.git
cd Citadel

# Install dependencies for each application after initialization
cd backend && npm install
cd ../frontend && npm install
```

Create environment files from the examples in each application when they are added:

```text
backend/.env
frontend/.env.local
```

Environment files must never be committed. The root `.gitignore` already excludes them while allowing safe `.env.example` files to be tracked.

## Database and Prisma

The backend will use Prisma to connect NestJS to PostgreSQL. The expected development workflow is:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

The exact commands may be adjusted when the backend package is initialized.

## Running the frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at the local URL printed by Next.js, normally `http://localhost:3000`.

## Development principles

- Keep the frontend and backend independently runnable.
- Use TypeScript throughout the application.
- Keep domain logic in clearly separated modules.
- Validate all external input at API boundaries.
- Protect HR and employee data with explicit authorization rules.
- Prefer database migrations over manual schema changes.
- Keep secrets and environment-specific settings outside Git.
- Add tests alongside important business rules and API behavior.
- Document significant architectural and product decisions in `docs/`.

## Initial architecture direction

The backend is expected to expose a versioned REST API from NestJS. Prisma will manage the PostgreSQL schema and migrations. Next.js will provide the authenticated web application and consume the backend API.

The first implementation should establish:

1. Authentication and user identity
2. Organization, department, and role structure
3. Employee management
4. Project and task management
5. Role-based authorization
6. Audit-friendly activity tracking

## Status

Citadel is at the initial project setup stage. The repository currently contains the project structure and foundational documentation; application modules are being built incrementally.

## License

Citadel is released under the MIT License. See [`LICENSE`](LICENSE) for details.
