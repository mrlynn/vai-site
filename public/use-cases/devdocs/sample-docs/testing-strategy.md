# Testing Strategy

**Last updated:** 2025-01-22
**Owner:** Platform Engineering
**Status:** Current

## Philosophy

We follow the testing pyramid model: a large base of fast unit tests, a middle layer of integration tests that verify service boundaries, and a small number of end-to-end tests that cover critical user journeys. Tests are not optional. Every pull request must include tests for new functionality and must not decrease overall coverage.

For how tests gate the deployment pipeline, see the [Deployment Guide](deployment-guide.md).

## Testing Pyramid

```
        /  E2E   \          ~5% of tests
       /  Tests   \         Playwright, critical flows only
      /____________\
     / Integration  \       ~15% of tests
    /    Tests       \      API routes, DB queries, Kafka consumers
   /__________________\
  /     Unit Tests     \    ~80% of tests
 /   Fast, isolated,    \   Pure functions, business logic
/________________________\
```

## Unit Tests

**Target coverage:** 80% line coverage per service (enforced in CI)

Unit tests cover individual functions, utility modules, and business logic in isolation. External dependencies (database, Redis, Kafka, HTTP clients) must be mocked or stubbed.

### Conventions

- **File location:** Co-located with source files as `*.test.js` or `*.test.ts`
- **Runner:** Jest for all services
- **Naming pattern:** Describe the behavior, not the implementation

```javascript
// Good: describes behavior
describe('calculateOrderTotal', () => {
  it('applies percentage discount to subtotal', () => { ... });
  it('returns zero when all items are removed', () => { ... });
  it('throws ValidationError when quantity is negative', () => { ... });
});

// Avoid: describes implementation
describe('calculateOrderTotal', () => {
  it('calls multiply function', () => { ... });
  it('uses reduce on items array', () => { ... });
});
```

### Fixtures and Factories

Each service has a `test/factories` directory containing factory functions for creating test data:

```javascript
// test/factories/order.js
const { faker } = require('@faker-js/faker');

function buildOrder(overrides = {}) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    items: [buildOrderItem()],
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
```

Use factories instead of inline object literals in tests. This keeps test data consistent and makes it easy to update when schemas change.

## Integration Tests

Integration tests verify that services interact correctly with their real dependencies: PostgreSQL, Redis, and Kafka.

### Test Database

Integration tests run against a real PostgreSQL instance managed by Docker Compose. Each test suite:

1. Runs migrations to set up the schema
2. Seeds necessary reference data
3. Executes tests within a transaction
4. Rolls back the transaction after each test

```bash
# Run integration tests locally using the test profile
docker compose --profile test up -d
npm run test:integration
```

### Kafka Integration Tests

For services that produce or consume Kafka events, integration tests use a real Kafka broker from the Docker Compose test profile. Tests verify:

- Events are published with the correct envelope format
- Consumers process events and update state correctly
- Dead letter queue handling for malformed events

### API Route Tests

API integration tests use `supertest` to make HTTP requests against the running service:

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('POST /api/orders', () => {
  it('creates an order and returns 201', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ items: [{ productId: 'prod_123', quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('orderId');
  });
});
```

## End-to-End Tests

E2E tests use Playwright to automate a real browser against the staging environment. These tests cover only the most critical user flows.

### Critical Flows Covered

| Flow | File | Run Frequency |
|------|------|---------------|
| User registration and login | `e2e/auth.spec.ts` | Every deploy |
| Browse products and add to cart | `e2e/catalog.spec.ts` | Every deploy |
| Complete checkout with payment | `e2e/checkout.spec.ts` | Every deploy |
| Order status tracking | `e2e/order-tracking.spec.ts` | Nightly |

### Running E2E Tests

```bash
# Run all e2e tests against staging
npx playwright test --config=e2e/playwright.config.ts

# Run a specific test file
npx playwright test e2e/checkout.spec.ts

# Run with headed browser for debugging
npx playwright test --headed e2e/checkout.spec.ts
```

## CI Pipeline Integration

All tests run automatically on every pull request:

1. **Unit tests** run first (fastest feedback, ~2 minutes)
2. **Integration tests** run in parallel using the Docker Compose test profile (~5 minutes)
3. **E2E tests** run against a preview deployment (~8 minutes)

A PR cannot be merged if any test suite fails. Coverage reports are posted as PR comments by the CI bot.

## Related Documents

- [Deployment Guide](deployment-guide.md)
- [Code Review Guidelines](code-review.md)
- [Local Development Setup](local-dev-setup.md)
