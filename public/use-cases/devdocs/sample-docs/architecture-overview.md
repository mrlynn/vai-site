# System Architecture Overview

**Last updated:** 2025-01-14
**Owner:** Platform Engineering
**Status:** Current

## Introduction

This document describes the high-level architecture of the Meridian Commerce platform. Meridian is built as a distributed system composed of independently deployable microservices, connected through an event-driven messaging layer. This architecture was chosen to support the team's need for independent scaling, fault isolation, and autonomous team ownership of individual services.

For infrastructure and environment details, see the [Deployment Guide](deployment-guide.md).

## Service Topology

The platform consists of four core services, an API gateway, and supporting infrastructure.

### Core Services

| Service | Responsibility | Data Store | Port |
|---|---|---|---|
| user-service | Authentication, user profiles, role management | PostgreSQL (users schema) | 3001 |
| order-service | Order lifecycle, event sourcing, fulfillment tracking | PostgreSQL (orders schema) + Kafka | 3002 |
| product-service | Product catalog, inventory, pricing | PostgreSQL (products schema) | 3003 |
| notification-service | Email, SMS, webhook delivery | PostgreSQL (notifications schema) + Redis | 3004 |

### API Gateway

All external traffic enters through a Kong-based API gateway running on port 8000. The gateway handles:

- Request routing to upstream services
- JWT token validation (delegated from user-service)
- Rate limiting enforcement
- Request/response logging
- TLS termination

Internal service-to-service communication bypasses the gateway and uses direct HTTP calls authenticated with API keys. See [API Authentication](api-authentication.md) for details on both auth mechanisms.

## Event-Driven Architecture

### Kafka as the Event Bus

Apache Kafka serves as the central event bus for asynchronous communication between services. The decision to use event sourcing for the order domain is documented in ADR-007 (Architecture Decision Records, internal wiki).

Key Kafka topics:

```
order.created        - Published when a new order is placed
order.status-changed - Published on every order state transition
order.cancelled      - Published when an order is cancelled
user.registered      - Published when a new user completes signup
product.updated      - Published when product details or inventory change
notification.send    - Consumed by notification-service for delivery
```

Each service owns its topics and publishes events using a standardized envelope format:

```json
{
  "eventId": "evt_01HQGX4N7RKZFJ3BVTM8P5WCDE",
  "eventType": "order.status-changed",
  "timestamp": "2025-01-14T10:32:00.000Z",
  "source": "order-service",
  "version": "1.0",
  "payload": {
    "orderId": "ord_01HQGX3F9KTPMR2DWVZ6YQAN8B",
    "previousStatus": "pending",
    "newStatus": "confirmed"
  }
}
```

### Consumer Groups

Each consuming service runs its own consumer group, ensuring independent processing and offset management. The notification-service, for example, subscribes to `order.status-changed` to trigger customer notifications without coupling to the order-service directly.

## Data Layer

### PostgreSQL

PostgreSQL 15 is the primary relational data store. Each service owns its own schema within a shared database cluster (staging) or dedicated database (production). Cross-service data access is strictly prohibited at the database level; services must communicate through APIs or events.

For schema details, naming conventions, and migration strategy, see [Database Schema](database-schema.md).

### Redis

Redis 7 is used for:

- **Session caching:** Short-lived session data for authenticated users
- **Rate limiting counters:** Sliding window counters for API rate limiting
- **Notification deduplication:** Preventing duplicate notification delivery within a time window
- **Product catalog cache:** Frequently accessed product data with a 5-minute TTL

Redis is configured as a single-node instance in staging and a 3-node Redis Cluster in production.

## Infrastructure Summary

All services are containerized with Docker and deployed to AWS ECS Fargate. The deployment topology includes:

- **Networking:** VPC with public and private subnets across two availability zones
- **Load balancing:** Application Load Balancer (ALB) in front of the API gateway
- **Database:** Amazon RDS for PostgreSQL with Multi-AZ failover
- **Message broker:** Amazon MSK (Managed Streaming for Apache Kafka)
- **Caching:** Amazon ElastiCache for Redis
- **Secrets:** AWS Secrets Manager, synced to 1Password for local development

For deployment procedures, CI/CD pipelines, and rollback instructions, see the [Deployment Guide](deployment-guide.md).

## Diagram

```
                    +-----------+
                    |   Client  |
                    +-----+-----+
                          |
                    +-----v-----+
                    | API Gateway|
                    |   (Kong)   |
                    +-----+-----+
                          |
          +-------+-------+-------+-------+
          |       |               |       |
     +----v--+ +--v------+  +----v--+ +--v-----------+
     | user  | | order   |  |product| | notification |
     |service| | service |  |service| | service      |
     +---+---+ +---+-----+  +---+---+ +------+-------+
         |         |             |            |
         +----+----+----+-------+            |
              |         |                    |
         +----v---+ +---v---+          +-----v----+
         |PostgreSQL| | Kafka |          |  Redis   |
         +---------+ +-------+          +----------+
```

## Related Documents

- [API Authentication](api-authentication.md)
- [Database Schema](database-schema.md)
- [Deployment Guide](deployment-guide.md)
- [Monitoring Runbook](monitoring-runbook.md)
