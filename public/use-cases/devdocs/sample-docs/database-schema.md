# Database Schema Documentation

**Last updated:** 2025-01-09
**Owner:** Platform Engineering
**Status:** Current

## Overview

The Meridian Commerce platform uses PostgreSQL 15 as its primary relational data store. Each microservice owns its own schema within the database, enforcing clear data boundaries. Cross-service data access at the database level is prohibited; services must use APIs or consume events to access data owned by another service.

For the overall architecture and data flow, see [Architecture Overview](architecture-overview.md).

## Schema Organization

| Schema | Owner Service | Description |
|---|---|---|
| `users` | user-service | User accounts, roles, and authentication data |
| `orders` | order-service | Orders, order events (event sourcing), and idempotency records |
| `products` | product-service | Product catalog, categories, and inventory |
| `notifications` | notification-service | Notification delivery records and webhook registrations |

## Key Tables

### users.users

Stores user account information.

```sql
CREATE TABLE users.users (
    id          VARCHAR(32) PRIMARY KEY,  -- ULID format: usr_01HQG...
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(128) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'viewer',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    preferences JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users.users (email);
CREATE INDEX idx_users_role ON users.users (role);
CREATE INDEX idx_users_status ON users.users (status);
CREATE INDEX idx_users_created_at ON users.users (created_at DESC);
```

The `preferences` column uses JSONB to store user-specific settings (timezone, locale, notification preferences) without requiring schema changes for new preference types.

### orders.orders

Stores the current materialized state of each order. This table is a projection rebuilt from the `order_events` table. It exists to support efficient queries without replaying the full event history on every read.

```sql
CREATE TABLE orders.orders (
    id               VARCHAR(32) PRIMARY KEY,  -- ULID format: ord_01HQG...
    user_id          VARCHAR(32) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    items            JSONB NOT NULL,
    shipping_address JSONB NOT NULL,
    subtotal         INTEGER NOT NULL,  -- cents
    tax              INTEGER NOT NULL,  -- cents
    total            INTEGER NOT NULL,  -- cents
    currency         VARCHAR(3) NOT NULL DEFAULT 'USD',
    metadata         JSONB DEFAULT '{}',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders.orders (user_id);
CREATE INDEX idx_orders_status ON orders.orders (status);
CREATE INDEX idx_orders_created_at ON orders.orders (created_at DESC);
CREATE INDEX idx_orders_user_status ON orders.orders (user_id, status);
```

### orders.order_events

The append-only event store for order state changes. This is the source of truth for order data.

```sql
CREATE TABLE orders.order_events (
    event_id   VARCHAR(32) PRIMARY KEY,  -- ULID format: evt_01HQG...
    order_id   VARCHAR(32) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload    JSONB NOT NULL,
    actor      VARCHAR(32) NOT NULL,  -- user ID or 'system'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_events_order_id ON orders.order_events (order_id, created_at ASC);
CREATE INDEX idx_order_events_type ON orders.order_events (event_type);
```

Events are never updated or deleted. The order-service rebuilds the materialized `orders` table row by replaying events for a given `order_id` whenever an inconsistency is detected.

### orders.idempotency_keys

Tracks idempotency keys to prevent duplicate order creation.

```sql
CREATE TABLE orders.idempotency_keys (
    key        VARCHAR(64) PRIMARY KEY,
    order_id   VARCHAR(32) NOT NULL,
    response   JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_idempotency_expires ON orders.idempotency_keys (expires_at);
```

A background job purges expired idempotency records daily.

### products.products

```sql
CREATE TABLE products.products (
    id          VARCHAR(32) PRIMARY KEY,  -- ULID format: prod_01HQG...
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    category    VARCHAR(100) NOT NULL,
    price       INTEGER NOT NULL,  -- cents
    currency    VARCHAR(3) NOT NULL DEFAULT 'USD',
    inventory   INTEGER NOT NULL DEFAULT 0,
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    attributes  JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products.products (category);
CREATE INDEX idx_products_status ON products.products (status);
CREATE INDEX idx_products_name_search ON products.products USING gin (to_tsvector('english', name));
```

The `attributes` JSONB column stores product-specific properties (dimensions, color, material) that vary by category.

### notifications.notifications

```sql
CREATE TABLE notifications.notifications (
    id           VARCHAR(32) PRIMARY KEY,
    user_id      VARCHAR(32) NOT NULL,
    channel      VARCHAR(20) NOT NULL,  -- 'email', 'sms', 'webhook'
    template     VARCHAR(100) NOT NULL,
    payload      JSONB NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'pending',
    attempts     INTEGER NOT NULL DEFAULT 0,
    last_attempt TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications.notifications (user_id);
CREATE INDEX idx_notifications_status ON notifications.notifications (status);
CREATE INDEX idx_notifications_created_at ON notifications.notifications (created_at DESC);
```

## Naming Conventions

All database objects follow these conventions:

| Object | Convention | Example |
|---|---|---|
| Schemas | Plural noun, snake_case | `users`, `orders` |
| Tables | Plural noun, snake_case | `order_events`, `idempotency_keys` |
| Columns | snake_case | `created_at`, `user_id` |
| Indexes | `idx_{table}_{column(s)}` | `idx_orders_user_status` |
| Primary keys | `id` (always) | `id VARCHAR(32)` |
| Foreign references | `{entity}_id` | `user_id`, `order_id` |
| Timestamps | Always `TIMESTAMPTZ` (UTC) | `created_at TIMESTAMPTZ` |

All timestamps are stored in UTC. Client applications handle timezone conversion for display.

## Migration Strategy

Database migrations are managed with `node-pg-migrate`. Migration files live in each service's `migrations/` directory and follow the naming pattern:

```
YYYYMMDDHHMMSS_description.js
```

Example:

```
20250108143000_add_users_preferences_column.js
```

### Running Migrations

```bash
# Apply all pending migrations
npm run db:migrate

# Rollback the last migration
npm run db:migrate:down

# Create a new migration file
npm run db:migrate:create -- add_index_on_orders_status
```

### Migration Rules

1. **Backward compatible only.** Migrations must not break the currently running version of the service. This means: add columns as nullable or with defaults, never rename columns directly, and never drop columns in the same release that stops using them.
2. **One concern per migration.** Each migration file should do one thing (add a table, add an index, alter a column).
3. **Test locally first.** Run `npm run db:migrate` against your local Docker PostgreSQL before pushing.
4. **Production migrations** run during a scheduled maintenance window, before the application deployment. See [Deployment Guide](deployment-guide.md) for the full deployment process.

## Cache Invalidation

When data is written to PostgreSQL, the owning service is responsible for invalidating or updating related Redis cache entries. The product-service, for example, invalidates the product cache key on any write to the `products` table.

For details on caching patterns and TTL configuration, see the Caching Strategy document (internal wiki).

## Related Documents

- [Architecture Overview](architecture-overview.md)
- [Local Development Setup](local-dev-setup.md)
- [Deployment Guide](deployment-guide.md)
- [Order API Endpoints](api-endpoints-orders.md)
