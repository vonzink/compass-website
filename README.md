# Compass Home Loans Website

Public marketing website for **Compass Home Loans**, a division of Mountain State
Financial Group, LLC.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS v4
- Prisma 7 with PostgreSQL
- Standalone Next.js deployment behind nginx and PM2

## Local Setup

```bash
npm ci
cp .env.example .env
npm run db:up
npm run db:deploy
npm run db:seed
npm run dev
```

The development site runs at `http://localhost:3000`. Local Postgres is exposed
on port `5435` by `docker-compose.dev.yml`.

## Quality Checks

```bash
npm test
npm run lint
NEXT_PUBLIC_SITE_URL=https://compasshl.us \
NEXT_PUBLIC_SITE_ENV=production \
npm run build
```

GitHub Actions runs the same checks for pushes and pull requests.

## Content

- Company and theme configuration: `src/content/site.ts`
- Navigation: `src/content/nav.ts`
- Loan officers: `src/content/officers.ts`
- Global application URL: `src/content/links.ts`
- Mortgage programs and rates: `src/content/categories.ts`, `src/content/rates.ts`

The database seed in `prisma/seed.ts` loads content from these modules. Do not add
unapproved loan officers, rates, testimonials, licensing claims, or compliance
language.

## Production

Production runs on `52.203.186.217` as PM2 process `compass-web` on loopback port
`3009`. nginx owns the public domain route. Deployments are immutable standalone
releases built locally from a clean commit already pushed to `origin/main`.

```bash
./deploy.sh
```

Use `./deploy.sh --migrate` only when the reviewed commit contains a new Prisma
migration. See [DEPLOYMENT.md](DEPLOYMENT.md) for release, rollback, DNS, and TLS
procedures.
