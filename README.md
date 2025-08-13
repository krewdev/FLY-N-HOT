# FLY-IN-HIGH — Monorepo (Backend scaffold)

This repository contains a production-ready scaffold for the FLY-IN-HIGH platform. It includes:

- API service (Node.js + TypeScript + Express + Prisma)
- PostgreSQL and Redis via Docker Compose
- Stripe/Twilio/Push integration stubs and webhooks
- Database schema matching the core spec (Users, PilotProfiles, Flights, Bookings, Reviews)

## Quickstart

Prerequisites:

- Node.js LTS (v18+ recommended)
- pnpm or npm (examples use pnpm; npm works too)
- Docker Desktop (for Postgres and Redis)

1) Start infra

```sh
docker compose -f docker-compose.yml up -d
```

2) Configure the API

```sh
cd apps/api
copy env.example .env
# Edit .env values as needed (Stripe/Twilio keys optional for local dev)

pnpm install
pnpm prisma generate
pnpm prisma migrate dev --name init
 pnpm dev
```

API runs on http://localhost:4000

### Deploy to Vercel (API as Serverless)

1) Install Vercel CLI and login
```
npm i -g vercel
vercel login
```
2) From repo root, run deploy
```
vercel --prod
```
The config in `vercel.json` routes all requests to `apps/api/api/index.ts` which wraps the Express app.

3) Smoke test

```sh
curl http://localhost:4000/health
```

You should see `{ "status": "ok" }`.

## Services

- `apps/api` — Express + Prisma API exposing endpoints for auth (stubs), flights, bookings (with Stripe stub), reviews (stub), and webhooks.
- `docker-compose.yml` — Postgres (port 5432) and Redis (port 6379).

## Environment

`apps/api/.env` (copy from `.env.example`):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fly_in_high?schema=public
REDIS_URL=redis://localhost:6379

JWT_SECRET=change_me

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

FIREBASE_SERVICE_ACCOUNT_JSON=
``` 

## API Routes (MVP)

- `GET /health` — Liveness
- `POST /auth/signup/password` — Stub registration
- `POST /auth/login/password` — Stub login
- `POST /pilots/flights` — Create flight (requires pilot auth in real impl)
- `GET /pilots/flights` — List pilot flights (filter by current user in real impl)
- `GET /flights/:flightId` — Public flight details
- `POST /bookings` — Create booking (invokes Stripe intent via stub service)
- `POST /webhooks/stripe` — Stripe webhooks endpoint (payment_intent.succeeded)

## Data Model (Prisma)

Key entities: Users, PilotProfiles, Flights, Bookings, Reviews.

Seats accounting handled via `totalSeats` and `seatsReserved`. `launchLocation` stored as GeoJSON `Json`.

## Next Steps

- Implement real Auth (email/password + OAuth) and role-based access control
- Replace stubs with Stripe/Twilio/Push implementations
- Add background worker for notifications and webhooks fanout
- Add Pilot and Admin web apps (Next.js) and Passenger mobile (Expo)

## License

Proprietary. All rights reserved (or replace with your preferred license).

# Deployment trigger Wed Aug 13 05:17:00 AM UTC 2025
# Deployment trigger Wed Aug 13 07:19:25 AM UTC 2025
