# Order API Endpoints

**Last updated:** 2025-01-13
**Owner:** Commerce Team
**Status:** Current

## Overview

The Order API handles the full order lifecycle: creation, status tracking, and cancellation. Orders are the core transactional entity in the Meridian Commerce platform and are implemented using an event-sourced model. Every state change is recorded as an immutable event in the `order_events` table, and the current state is derived by replaying those events.

The decision to use event sourcing for the order domain is documented in ADR-007 (Architecture Decision Records, internal wiki). The primary motivations were full auditability, the ability to reconstruct order state at any point in time, and reliable event publishing to downstream consumers.

For authentication requirements, see [API Authentication](api-authentication.md).

## Base URL

```
/api/v1/orders
```

## Order States

An order transitions through a defined set of states. Transitions are enforced by the order-service and invalid transitions return a `422` error.

```
pending --> confirmed --> processing --> shipped --> delivered
   |            |            |
   +-----+------+------------+
         |
     cancelled
```

| State | Description |
|---|---|
| `pending` | Order created, awaiting payment confirmation |
| `confirmed` | Payment verified, order accepted for fulfillment |
| `processing` | Order is being picked, packed, or prepared |
| `shipped` | Order has been handed off to the shipping carrier |
| `delivered` | Carrier confirmed delivery to the customer |
| `cancelled` | Order was cancelled (allowed from pending, confirmed, or processing) |

Each state transition publishes an `order.status-changed` event to Kafka. Downstream services (notification-service, analytics) consume these events independently.

## Endpoints

### Create Order

Places a new order. The order starts in `pending` state.

```
POST /api/v1/orders
```

**Auth:** `@RequireAuth()` `@RequireRole("admin", "member")`

**Headers:**

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | Bearer token |
| `X-Idempotency-Key` | Yes | Client-generated unique key (UUID v4 recommended) |

The `X-Idempotency-Key` header is required for order creation. If the server receives a second request with the same idempotency key within 24 hours, it returns the original response without creating a duplicate order. This protects against network retries and duplicate submissions.

**Request Body:**

```json
{
  "items": [
    {
      "productId": "prod_01HQG7VMKX9R3DJPZ2TN5QFWYB",
      "quantity": 2
    },
    {
      "productId": "prod_01HQG8ABCN4RTEK7Y3WP6MHXSD",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "line1": "123 Commerce St",
    "line2": "Suite 400",
    "city": "Portland",
    "state": "OR",
    "postalCode": "97201",
    "country": "US"
  },
  "metadata": {
    "source": "web",
    "campaignId": "winter-2025"
  }
}
```

**Response (201 Created):**

```json
{
  "data": {
    "id": "ord_01HQGX3F9KTPMR2DWVZ6YQAN8B",
    "status": "pending",
    "items": [
      {
        "productId": "prod_01HQG7VMKX9R3DJPZ2TN5QFWYB",
        "name": "Wireless Keyboard",
        "quantity": 2,
        "unitPrice": 4999,
        "subtotal": 9998
      }
    ],
    "subtotal": 14997,
    "tax": 1200,
    "total": 16197,
    "currency": "USD",
    "createdAt": "2025-01-13T16:45:00.000Z"
  }
}
```

All monetary values are represented in the smallest currency unit (cents for USD).

### Get Order

Retrieves a single order by ID, including its current state.

```
GET /api/v1/orders/:id
```

**Auth:** `@RequireAuth()`

Users can retrieve their own orders. Admins can retrieve any order.

### List Orders

Returns a paginated list of orders for the authenticated user. Admins can list all orders across users.

```
GET /api/v1/orders
```

**Auth:** `@RequireAuth()`

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | (none) | Cursor for pagination |
| `limit` | integer | 20 | Results per page (max 100) |
| `status` | string | (none) | Filter by order state |
| `createdAfter` | ISO 8601 | (none) | Filter orders created after this timestamp |
| `createdBefore` | ISO 8601 | (none) | Filter orders created before this timestamp |

### Get Order Event History

Returns the complete event history for an order, showing every state transition with timestamps and metadata.

```
GET /api/v1/orders/:id/events
```

**Auth:** `@RequireAuth()` `@RequireRole("admin", "member")`

**Response (200 OK):**

```json
{
  "data": [
    {
      "eventId": "evt_01HQGX4N7RKZFJ3BVTM8P5WCDE",
      "eventType": "order.created",
      "timestamp": "2025-01-13T16:45:00.000Z",
      "actor": "usr_01HQGX4N7RKZFJ3BVTM8P5WCDE",
      "payload": { "status": "pending" }
    },
    {
      "eventId": "evt_01HQGX5R2MBNPW4CXKZ7DJTYQA",
      "eventType": "order.status-changed",
      "timestamp": "2025-01-13T16:47:30.000Z",
      "actor": "system",
      "payload": { "previousStatus": "pending", "newStatus": "confirmed" }
    }
  ]
}
```

### Cancel Order

Cancels an order. Only allowed when the order is in `pending`, `confirmed`, or `processing` state.

```
POST /api/v1/orders/:id/cancel
```

**Auth:** `@RequireAuth()`

**Request Body:**

```json
{
  "reason": "Customer requested cancellation"
}
```

### Update Order Status (Internal)

Used by internal services (fulfillment, shipping integration) to advance order state.

```
PUT /internal/orders/:id/status
```

**Auth:** Service-to-service (X-Service-Key header)

This endpoint is not exposed through the API gateway.

## Webhook Notifications

Customers and integrations can register webhook URLs to receive real-time notifications on order status changes. The notification-service consumes `order.status-changed` events from Kafka and dispatches webhook calls with the following payload:

```json
{
  "event": "order.status-changed",
  "timestamp": "2025-01-13T16:47:30.000Z",
  "data": {
    "orderId": "ord_01HQGX3F9KTPMR2DWVZ6YQAN8B",
    "previousStatus": "pending",
    "newStatus": "confirmed"
  }
}
```

Webhook deliveries include an `X-Meridian-Signature` header for payload verification. Failed deliveries are retried up to 5 times with exponential backoff (1s, 5s, 30s, 2m, 10m).

## Related Documents

- [API Authentication](api-authentication.md)
- [User API Endpoints](api-endpoints-users.md)
- [Database Schema](database-schema.md)
- [Architecture Overview](architecture-overview.md)
