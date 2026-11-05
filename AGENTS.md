# AGENTS.md

This repository contains the public Compass Home Loans website. It is a dedicated
Compass deployment of the shared mortgage-marketing platform.

## Product Rules

- Public brand: **Compass Home Loans**.
- Legal entity: **Mountain State Financial Group, LLC**, company NMLS #1314257.
- Current public loan officers: **Will Provost** and **Seth Angell** only.
- Primary phone: `218-820-7321`; office: `1630 1st Ave N Ste B, Fargo, ND 58102`.
- Global Purchase, Refinance, and Apply actions use Will Provost's Blink URL from
  `src/content/links.ts` until another destination is explicitly approved.
- Rates navigation, AI mode, and Ask AI chat stay hidden until explicitly approved.
- Do not restore personnel, contact details, or assets removed from the Compass site.
- Treat mortgage rates, licensing claims, testimonials, and compliance language as
  approval-controlled content. Do not invent or infer them.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4.
- Prisma 7 with PostgreSQL through `@prisma/adapter-pg`.
- Content defaults live in `src/content/`; the database is seeded from those files.
- The production app uses dedicated tenant mode with `TENANT_SLUG=compass`.

## Local Commands

```bash
npm ci
npm run db:up
npm run db:deploy
npm run db:seed
npm run dev

npm test
npm run lint
npm run build
```

Local Postgres is exposed on port `5435`; copy `.env.example` to `.env` before
running database commands.

## Database Rules

- Add schema changes as new migrations under `prisma/migrations/`.
- Never edit an applied migration.
- Never run `prisma migrate dev` against production.
- Production uses the isolated `compass` schema in the shared RDS database.
- Run production migrations only through the documented `./deploy.sh --migrate`
  path and review the migration SQL first.

## Deployment

- Source of truth: `https://github.com/vonzink/compass-website`.
- Production host: `52.203.186.217`.
- Runtime: PM2 process `compass-web`, loopback port `3009`, nginx in front.
- Build locally; do not build on the server.
- `./deploy.sh` requires a clean `main` commit already pushed to `origin/main`,
  uploads an immutable standalone release, atomically switches `current`, verifies
  health, and retains rollback releases.
- Runtime secrets live only in `/home/ubuntu/apps/compass-website/shared/.env` on
  the server. Never commit or print them.
- DNS and TLS cutover are separate from application deployment. Do not change DNS
  or request a certificate unless the user explicitly authorizes that step.

See `DEPLOYMENT.md` for the complete runbook.
