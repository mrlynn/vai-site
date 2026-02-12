# Local Development Environment Setup

**Last updated:** 2025-01-08
**Owner:** Developer Experience
**Status:** Current

## Overview

This guide walks you through setting up the Meridian Commerce platform on your local machine. By the end, you will have all four microservices running with their supporting infrastructure (PostgreSQL, Kafka, Redis) and a seeded development database.

For broader first-day context including team introductions, Slack channels, and access requests, see the Onboarding Checklist (internal wiki).

## Prerequisites

Before starting, ensure you have the following installed and configured:

| Tool | Version | Notes |
|---|---|---|
| Docker Desktop | 4.x or later | Allocate at least 6 GB of memory (see Troubleshooting) |
| Node.js | 20 LTS (v20.11+) | Recommend using `nvm` for version management |
| npm | 10.x+ | Ships with Node.js 20 |
| Git | 2.40+ | Ensure SSH key is added to GitHub |
| 1Password CLI | 2.x | Required for pulling development secrets |

You also need access to the following:

- **GitHub:** Membership in the `meridian-eng` organization
- **1Password:** Access to the "Engineering - Development" vault
- **AWS SSO:** Development account access (for optional cloud service testing)

## Setup Steps

### 1. Clone the Monorepo

```bash
git clone git@github.com:meridian-eng/meridian-platform.git
cd meridian-platform
```

### 2. Install Dependencies

The monorepo uses npm workspaces. A single install at the root handles all services:

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file for each service:

```bash
cp .env.example .env
```

Then populate secrets from 1Password:

```bash
op inject -i .env.example -o .env
```

This command reads secret references in `.env.example` (formatted as `op://vault/item/field`) and replaces them with actual values from your 1Password vault. If you do not have the 1Password CLI configured, you can manually copy values from the "Engineering - Development" vault entry in the 1Password desktop app.

The `.env` file is gitignored. Never commit it to the repository.

### 4. Start Infrastructure Services

Docker Compose manages PostgreSQL, Kafka (with Zookeeper), and Redis:

```bash
docker compose up -d
```

This starts the following containers:

| Container | Port | Description |
|---|---|---|
| `meridian-postgres` | 5432 | PostgreSQL 15 database |
| `meridian-kafka` | 9092 | Apache Kafka broker |
| `meridian-zookeeper` | 2181 | Kafka dependency |
| `meridian-redis` | 6379 | Redis 7 cache |

Wait approximately 15 seconds for all containers to reach a healthy state before proceeding.

### 5. Run Database Migrations

Apply all pending migrations:

```bash
npm run db:migrate
```

This runs `node-pg-migrate` across all service schemas. For details on the migration strategy, see [Database Schema](database-schema.md).

### 6. Seed Development Data

Populate the database with realistic test data:

```bash
npm run db:seed
```

The seed script creates:
- 5 admin users, 20 member users, 10 viewer users
- 200 products across multiple categories
- 500 orders in various states with full event histories
- Sample notification records

Default admin credentials for local development:

```
Email:    admin@meridiancommerce.io
Password: dev-admin-2025
```

### 7. Start All Services

```bash
npm run dev
```

This starts all four services in development mode with hot reloading:

| Service | URL |
|---|---|
| API Gateway | http://localhost:8000 |
| user-service | http://localhost:3001 |
| order-service | http://localhost:3002 |
| product-service | http://localhost:3003 |
| notification-service | http://localhost:3004 |

### 8. Verify the Setup

Run the health check script to confirm everything is working:

```bash
npm run health-check
```

Expected output:

```
[OK] PostgreSQL ............... connected (5432)
[OK] Kafka ................... connected (9092)
[OK] Redis ................... connected (6379)
[OK] user-service ............ healthy (3001)
[OK] order-service ........... healthy (3002)
[OK] product-service ......... healthy (3003)
[OK] notification-service .... healthy (3004)
[OK] API Gateway ............. healthy (8000)

All systems operational.
```

You can also verify manually:

```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","timestamp":"..."}
```

## Troubleshooting

### Docker runs out of memory

**Symptom:** Containers crash or restart repeatedly, especially Kafka.

**Fix:** Open Docker Desktop, go to Settings > Resources, and increase memory to at least 6 GB. The full stack (Postgres, Kafka, Zookeeper, Redis) requires approximately 4 GB at baseline.

### Port conflicts

**Symptom:** `docker compose up` fails with "port is already in use."

**Fix:** Check for conflicting processes:

```bash
lsof -i :5432    # PostgreSQL
lsof -i :9092    # Kafka
lsof -i :6379    # Redis
```

Stop the conflicting process, or override the port in your `.env` file (e.g., `POSTGRES_PORT=5433`).

### VPN interferes with Docker networking

**Symptom:** Services cannot resolve container hostnames. API calls between services timeout.

**Fix:** If you are connected to the corporate VPN, Docker's DNS resolution can fail. Add the following to your Docker Desktop settings under "Docker Engine":

```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

Alternatively, disconnect from the VPN while running the local stack. The VPN is only required for accessing staging/production environments.

### Migrations fail with "role does not exist"

**Symptom:** `npm run db:migrate` fails with a PostgreSQL role error.

**Fix:** The Docker container creates the default role on first startup. If you previously ran Docker with different settings, remove the volume and start fresh:

```bash
docker compose down -v
docker compose up -d
```

## Related Documents

- [Architecture Overview](architecture-overview.md)
- [Database Schema](database-schema.md)
- [Deployment Guide](deployment-guide.md)
- [API Authentication](api-authentication.md)
