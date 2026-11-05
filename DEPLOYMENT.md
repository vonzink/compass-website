# Compass Home Loans Deployment Runbook

## Production Topology

| Component | Value |
|---|---|
| Repository | `https://github.com/vonzink/compass-website` |
| Host | `ubuntu@52.203.186.217` |
| Application root | `/home/ubuntu/apps/compass-website` |
| PM2 process | `compass-web` |
| Application listener | `127.0.0.1:3009` |
| nginx site | `/etc/nginx/sites-available/compasshl.us` |
| Domains | `compasshl.us`, `www.compasshl.us` |
| Database | Shared RDS database, isolated PostgreSQL schema `compass` |

The server does not build the application. A release is built and verified locally,
uploaded as a standalone Next.js bundle, and activated through an atomic `current`
symlink. PM2 is then reloaded and the previous release remains available for
rollback.

## Server Layout

```text
/home/ubuntu/apps/compass-website/
  current -> releases/<timestamp>-<commit>/
  previous -> releases/<prior-release>/
  releases/
  shared/.env
  ecosystem.config.cjs
```

`shared/.env` is mode `600`, exists only on the server, and is symlinked into each
release. It contains the database URLs and runtime configuration. Never commit,
download, print, or replace that file during a normal deployment.

## Normal Deployment

Deployments must come from a clean `main` checkout whose commit exactly matches
`origin/main`.

```bash
git switch main
git pull --ff-only
./deploy.sh
```

The script performs:

1. Git source-of-truth checks.
2. `npm ci`, all tests, lint, and a production standalone build.
3. Upload to a new immutable release directory.
4. Atomic `current` symlink switch.
5. PM2 reload and database health verification.
6. nginx Host-header checks for the homepage and health endpoint.
7. Rollback to the prior release if activation fails.
8. Retention of the three newest releases.

## Database Migrations

Review every new SQL file in `prisma/migrations/` before deployment. Apply pending
production migrations with:

```bash
./deploy.sh --migrate
```

The command reads the production connection URL from the server without printing it,
uses the AWS RDS CA bundle with full certificate verification, and runs
`prisma migrate deploy` locally. Never run `prisma migrate dev` against production.

Content seeding is not part of a normal deployment because it can update published
content. Run it only as an explicit, reviewed operation.

## Rollback

```bash
./deploy.sh --rollback
```

Rollback atomically switches `current` to the retained `previous` release, reloads
PM2, and reruns the health check. Database migrations are not rolled back by this
command; schema changes must therefore remain backward-compatible across one release.

## Runtime Verification

Before DNS cutover, verify nginx using an explicit Host header:

```bash
curl --resolve compasshl.us:80:52.203.186.217 http://compasshl.us/api/v1/health
curl --resolve compasshl.us:80:52.203.186.217 http://compasshl.us/
```

Expected health response:

```json
{"ok":true,"db":"up"}
```

Operational checks:

```bash
ssh -i /Users/zacharyzink/MSFG/Security/msfg-mortgage-key.pem ubuntu@52.203.186.217
pm2 show compass-web
pm2 logs compass-web --lines 50 --nostream
sudo nginx -t
```

## DNS and HTTPS Cutover

Application deployment does not change DNS. At GoDaddy, when cutover is approved:

1. Change the apex `A` record (`@`) to `52.203.186.217`.
2. Change `www` from `sites.ludicrous.cloud` to CNAME `@`.
3. Leave `info`, MX, SPF, DKIM, DMARC, and other email records unchanged.
4. Wait until both public names resolve to `52.203.186.217`.
5. Issue TLS on the server:

```bash
sudo certbot --nginx -d compasshl.us -d www.compasshl.us --redirect
```

6. Verify HTTPS, redirects, assets, the health endpoint, application links, and both
   officer profiles before disconnecting the old GoHighLevel website.

## Recovery Notes

- nginx configuration is tracked at `deploy/nginx/compasshl.us.conf`.
- PM2 configuration is tracked at `deploy/ecosystem.config.cjs`.
- `pm2 save` persists the process list for reboot recovery.
- The host is shared with other MSFG services. Do not restart nginx before
  `sudo nginx -t` succeeds, and do not delete unrelated PM2 processes or files.
- The root volume was 91% utilized at initial deployment. Release retention is capped
  at three, but capacity should still be reviewed before adding more applications.
