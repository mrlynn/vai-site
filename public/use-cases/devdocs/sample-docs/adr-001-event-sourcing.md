# ADR-001: Event Sourcing for Order Service

**Date:** 2024-11-15
**Status:** Accepted
**Deciders:** Sarah Chen (Engineering Lead), David Park (Order Team Lead), Priya Sharma (Staff Engineer)

## Context

The order-service manages the full lifecycle of customer orders, from creation through fulfillment and delivery. This domain has several characteristics that make traditional CRUD persistence challenging:

1. **Complex state transitions:** Orders move through many states (pending, confirmed, payment processed, shipped, delivered, cancelled, refunded) with business rules governing valid transitions.
2. **Regulatory audit requirements:** Our payment processor and compliance team require a complete, tamper-evident history of every change to an order, including who made the change and when.
3. **Retroactive corrections:** Customer support occasionally needs to reconstruct exactly what happened with an order, including intermediate states that may have been overwritten in a CRUD model.
4. **Cross-service coordination:** Other services (notification-service, analytics) need to react to order state changes in real time.

The existing CRUD-based order model stores only the current state. Audit requirements were partially met with an `order_audit_log` table, but this approach proved incomplete: it missed changes from background jobs, and the audit records were structurally inconsistent.

## Decision

We will adopt event sourcing as the persistence pattern for the order-service. Apache Kafka will serve as the event store, with a PostgreSQL read model for query support.

### Event Design

The order lifecycle is modeled as a sequence of immutable events:

| Event | Trigger | Key Payload Fields |
|-------|---------|--------------------|
| `OrderCreated` | Customer places an order | userId, items, shippingAddress, totalAmount |
| `OrderConfirmed` | Inventory reserved successfully | confirmedAt, estimatedDelivery |
| `PaymentProcessed` | Payment gateway confirms charge | paymentId, amount, method |
| `OrderShipped` | Warehouse marks order as shipped | trackingNumber, carrier, shippedAt |
| `OrderDelivered` | Carrier confirms delivery | deliveredAt, signedBy |
| `OrderCancelled` | Customer or system cancels order | reason, cancelledBy, refundAmount |

Each event follows the standard Kafka envelope format defined in the [Architecture Overview](architecture-overview.md).

### State Reconstruction

The current state of an order is derived by replaying all events for that order in sequence:

```javascript
function rebuildOrderState(events) {
  return events.reduce((state, event) => {
    switch (event.eventType) {
      case 'OrderCreated':
        return { ...event.payload, status: 'pending', events: [event] };
      case 'OrderConfirmed':
        return { ...state, status: 'confirmed', confirmedAt: event.payload.confirmedAt };
      case 'PaymentProcessed':
        return { ...state, status: 'payment_processed', paymentId: event.payload.paymentId };
      case 'OrderShipped':
        return { ...state, status: 'shipped', trackingNumber: event.payload.trackingNumber };
      case 'OrderDelivered':
        return { ...state, status: 'delivered', deliveredAt: event.payload.deliveredAt };
      case 'OrderCancelled':
        return { ...state, status: 'cancelled', cancelReason: event.payload.reason };
      default:
        return state;
    }
  }, {});
}
```

### Read Model (CQRS)

For query efficiency, a PostgreSQL read model is maintained by a Kafka consumer that projects events into a denormalized `orders_view` table. This table supports the order listing, search, and reporting queries that would be expensive to compute by replaying events on every read.

The read model is eventually consistent. For use cases requiring the absolute latest state (e.g., payment processing), the service reads directly from the event stream.

## Consequences

### Benefits

- **Complete audit trail:** Every state change is recorded as an immutable event. This fully satisfies compliance and audit requirements.
- **Temporal queries:** We can reconstruct the state of any order at any point in time by replaying events up to that timestamp.
- **Natural event-driven integration:** Other services already consume Kafka events. Event sourcing eliminates the need for separate "change notification" logic.
- **Debugging support:** When investigating issues, engineers can replay the full event history to understand exactly how an order reached its current state.

### Tradeoffs

- **Increased complexity:** Event sourcing requires developers to think in terms of events rather than state mutations. The learning curve is steeper than CRUD.
- **Eventual consistency:** The read model may lag behind the event stream by a few seconds. UI components need to account for this (e.g., optimistic updates after order creation).
- **Event schema evolution:** Changing event schemas requires careful versioning. We will use a `version` field in the event envelope and maintain backward-compatible consumers.
- **Storage growth:** Kafka topic retention must be configured for long-term storage. We use compacted topics with a retention period of 365 days, with older events archived to S3.

## Alternatives Considered

### CRUD with Audit Log Table

The existing approach. An `order_audit_log` table records changes triggered by API calls.

**Rejected because:** The audit log was incomplete. Changes from background jobs, Kafka consumers, and database migrations were not captured. The log structure was inconsistent across different types of changes, making it unreliable for compliance.

### Saga Pattern Without Event Sourcing

Use the saga pattern for cross-service coordination while keeping CRUD persistence for order state.

**Rejected because:** While the saga pattern solves the coordination problem, it does not address the auditability requirement. We still need a complete history of state transitions, which sagas alone do not provide. Note: we may still use sagas for multi-service transactions on top of event sourcing.

## Related Documents

- [Architecture Overview](architecture-overview.md)
- [Database Schema](database-schema.md)
- [ADR-002: GraphQL for Client API](adr-002-graphql.md)
