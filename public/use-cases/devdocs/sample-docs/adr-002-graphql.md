# ADR-002: GraphQL for Client API

**Date:** 2024-12-03
**Status:** Accepted
**Deciders:** Sarah Chen (Engineering Lead), Marco Rivera (Frontend Lead), David Park (Order Team Lead)

## Context

Meridian Commerce serves two primary client applications: a responsive web app and native mobile apps (iOS and Android). These clients have fundamentally different data requirements for the same underlying resources.

### Problems with the Current REST API

1. **Over-fetching:** The mobile app's order summary screen needs only the order status, total, and item count. The REST endpoint `GET /api/orders/:id` returns the full order object, including shipping addresses, payment details, and complete item lists. This wastes bandwidth on mobile connections.

2. **Under-fetching and multiple round-trips:** The web app's dashboard requires data from multiple services in a single view: user profile, recent orders, and recommended products. This requires three separate REST calls (`/api/users/me`, `/api/orders?limit=5`, `/api/products/recommended`), resulting in a waterfall of network requests.

3. **Endpoint proliferation:** To address the above issues, the team has started creating client-specific endpoints (`/api/mobile/order-summary`, `/api/web/dashboard`). This approach does not scale and creates maintenance burden across teams.

4. **Documentation drift:** REST API documentation frequently falls out of sync with the actual implementation. There is no compile-time validation that the API contract matches the code.

## Decision

We will adopt GraphQL, using Apollo Server, as the API layer for all client-facing applications. The GraphQL gateway will be a new service (`graphql-gateway`) that sits between clients and the existing microservices.

### Architecture

```
  Web App / Mobile App
         |
    +----v-------+
    | GraphQL    |   New: Apollo Server gateway
    | Gateway    |   Handles client queries and mutations
    +----+-------+
         |
    +----+----+--------+---------+
    |         |        |         |
  user-    order-   product-  notification-
  service  service  service   service
```

REST APIs remain the communication protocol for service-to-service calls. The GraphQL gateway translates client queries into REST calls to downstream services.

### Schema Design

The GraphQL schema follows a domain-driven structure:

```graphql
type Query {
  me: User!
  order(id: ID!): Order
  orders(first: Int, after: String, status: OrderStatus): OrderConnection!
  product(id: ID!): Product
  products(first: Int, after: String, category: String): ProductConnection!
}

type Mutation {
  createOrder(input: CreateOrderInput!): CreateOrderPayload!
  cancelOrder(id: ID!): CancelOrderPayload!
  updateProfile(input: UpdateProfileInput!): UpdateProfilePayload!
}

type User {
  id: ID!
  email: String!
  name: String!
  recentOrders(first: Int): [Order!]!
}

type Order {
  id: ID!
  status: OrderStatus!
  items: [OrderItem!]!
  total: Money!
  createdAt: DateTime!
  tracking: TrackingInfo
}
```

### DataLoader for Batching

To prevent the N+1 query problem, all downstream service calls use Facebook's DataLoader pattern for request-level batching and caching:

```javascript
const orderLoader = new DataLoader(async (orderIds) => {
  const orders = await orderServiceClient.getOrdersByIds(orderIds);
  return orderIds.map(id => orders.find(o => o.id === id));
});

// In resolver
const resolvers = {
  User: {
    recentOrders: (user, args, { loaders }) => {
      return loaders.order.loadMany(user.recentOrderIds);
    },
  },
};
```

### Query Depth and Complexity Limiting

To protect against abusive queries, the gateway enforces:

- **Maximum query depth:** 7 levels
- **Maximum query complexity:** 1000 points (each field has an assigned cost)
- **Rate limiting:** 100 queries per minute per authenticated user

```javascript
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');

const server = new ApolloServer({
  schema,
  validationRules: [
    depthLimit(7),
    createComplexityLimitRule(1000),
  ],
});
```

### Migration Strategy

The migration from REST to GraphQL for client applications will be gradual:

| Phase | Timeline | Scope |
|-------|----------|-------|
| Phase 1 | Q1 2025 | GraphQL gateway deployed. New features built in GraphQL. |
| Phase 2 | Q2 2025 | Mobile app migrates to GraphQL for all read operations. |
| Phase 3 | Q3 2025 | Web app migrates to GraphQL. REST client endpoints deprecated. |
| Phase 4 | Q4 2025 | Legacy REST client endpoints removed. |

During the migration period, both REST and GraphQL endpoints are available. Feature parity is maintained until Phase 4.

### Type Safety with Codegen

Both the web and mobile clients use GraphQL Code Generator to produce TypeScript types from the schema. This ensures compile-time type safety between the API and client code:

```bash
# Generate types from the GraphQL schema
npx graphql-codegen --config codegen.yml
```

The codegen step runs as part of the client build process and in CI. If the schema changes in a way that breaks existing queries, the client build fails, catching the issue before deployment.

## Consequences

### Benefits

- **Single request for complex views:** The dashboard view that previously required three REST calls can be fetched in a single GraphQL query, reducing latency and simplifying client code.
- **Type safety:** The schema serves as a living contract. Combined with codegen, both server and client code are type-checked against the same schema.
- **Client-driven data fetching:** Mobile and web clients request exactly the fields they need. No over-fetching, no client-specific endpoints.
- **Self-documenting API:** GraphQL's introspection provides built-in, always-accurate documentation via tools like GraphQL Playground.

### Tradeoffs

- **Increased server complexity:** The GraphQL gateway is a new service that requires its own deployment, monitoring, and on-call rotation. Resolver logic must be carefully designed to avoid performance pitfalls.
- **Caching challenges:** HTTP caching (CDN, browser) is straightforward with REST because each URL represents a resource. GraphQL uses a single endpoint with POST requests, making HTTP-level caching ineffective. We rely on Apollo's in-memory cache on the client and application-level caching on the server.
- **Learning curve:** Engineers accustomed to REST need to learn GraphQL schema design, resolver patterns, and the DataLoader batching model.
- **Query depth limiting:** Without proper safeguards, deeply nested queries can cause performance issues. The depth and complexity limits add configuration overhead.

## Alternatives Considered

### BFF (Backend for Frontend) Pattern

Build separate API backends for web and mobile, each returning exactly what the client needs.

**Rejected because:** This approach solves the over-fetching problem but creates significant duplication. Each BFF requires its own development, testing, and deployment. With two clients today and potential third-party API access planned, the BFF approach would not scale.

### REST with Sparse Fieldsets (JSON:API)

Use the JSON:API specification's `fields` parameter to allow clients to request specific fields from REST endpoints.

**Rejected because:** While sparse fieldsets address over-fetching for single resources, they do not solve the multiple round-trip problem for views that span multiple resource types. Additionally, JSON:API adoption across the team was low, and the tooling ecosystem is less mature than GraphQL.

## Related Documents

- [Architecture Overview](architecture-overview.md)
- [API Authentication](api-authentication.md)
- [ADR-001: Event Sourcing for Order Service](adr-001-event-sourcing.md)
- [Error Handling](error-handling.md)
