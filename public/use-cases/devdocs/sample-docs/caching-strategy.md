# Caching Strategy

**Last updated:** 2025-01-23
**Owner:** Platform Engineering
**Status:** Current

## Overview

Caching is critical to Meridian Commerce's performance. Our caching architecture operates at three layers, each serving a different purpose and operating at a different scope. This document covers cache key conventions, TTL policies, invalidation strategies, and operational guidance.

For details on the data models being cached, see [Database Schema](database-schema.md).

## Three Cache Layers

```
  Client Request
       |
  +----v----+
  | CDN     |  Layer 3: CloudFront (static assets, public content)
  +---------+
       |
  +----v----+
  | Redis   |  Layer 2: Application cache (shared across instances)
  +---------+
       |
  +----v----+
  | In-Proc |  Layer 1: Request cache (per-request memoization)
  +---------+
       |
  +----v----+
  | Database|
  +---------+
```

### Layer 1: Request Cache (Per-Request Memoization)

Each incoming HTTP request may need to resolve the same data multiple times (e.g., looking up the current user in both the auth middleware and the request handler). Request-scoped caching avoids redundant database queries within a single request lifecycle.

Implementation uses a simple `Map` attached to the request context:

```javascript
// middleware/requestCache.js
function requestCache(req, res, next) {
  req.cache = new Map();
  next();
}

// Usage in service layer
async function getUser(req, userId) {
  const cacheKey = `user:${userId}`;
  if (req.cache.has(cacheKey)) {
    return req.cache.get(cacheKey);
  }
  const user = await db.users.findById(userId);
  req.cache.set(cacheKey, user);
  return user;
}
```

This cache is garbage collected automatically when the request completes. No TTL management is needed.

### Layer 2: Application Cache (Redis)

Redis serves as the shared application cache, accessible by all instances of a service. This is the primary caching layer for frequently accessed data.

**Redis cluster topology:**
- Staging: Single Redis 7 node
- Production: 3-node Redis Cluster via Amazon ElastiCache

### Layer 3: CDN Cache (CloudFront)

Amazon CloudFront caches static assets and public API responses at edge locations. Cache behavior is controlled through HTTP headers set by the application:

```javascript
// Static assets: aggressive caching
res.set('Cache-Control', 'public, max-age=31536000, immutable');

// Public API responses: short TTL
res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

// Authenticated responses: no CDN caching
res.set('Cache-Control', 'private, no-store');
```

## Cache Key Naming Convention

All Redis cache keys follow the pattern: `service:entity:identifier`

| Key Pattern | Example | Description |
|-------------|---------|-------------|
| `user-service:user:{id}` | `user-service:user:usr_01HRK` | User profile data |
| `user-service:session:{token}` | `user-service:session:abc123` | Session data |
| `product-service:product:{id}` | `product-service:product:prod_42` | Product details |
| `product-service:catalog:page:{n}` | `product-service:catalog:page:1` | Paginated catalog listing |
| `order-service:order:{id}` | `order-service:order:ord_789` | Order summary |
| `platform:rate-limit:{ip}` | `platform:rate-limit:192.168.1.1` | Rate limit counter |

Rules:
- Always prefix with the owning service name
- Use colons as delimiters
- Keep keys human-readable for debugging with `redis-cli`
- Never store sensitive data (passwords, tokens) in cache values

## TTL Strategy

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| User profiles | 5 minutes | Changes infrequently, but must reflect updates within a reasonable window |
| Product catalog | 1 hour | Updated through a controlled publishing workflow |
| Feature flags | 30 seconds | Must converge quickly when flags are toggled |
| Rate limit counters | Matches the rate limit window | Sliding window, typically 60 seconds |
| Session data | 24 hours | Aligned with JWT token expiration |
| Order summaries | 2 minutes | Frequent status transitions during active orders |

## Cache Invalidation

Cache invalidation follows two patterns depending on the data's consistency requirements.

### Write-Through Invalidation

Used for user data where consistency is important. When a write occurs, the cache is updated synchronously before the response is returned.

```javascript
async function updateUserProfile(userId, updates) {
  // Update database
  const user = await db.users.update(userId, updates);

  // Update cache immediately
  const cacheKey = `user-service:user:${userId}`;
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 300); // 5 min TTL

  return user;
}
```

### Event-Driven Invalidation

Used for product data where eventual consistency is acceptable. When a product is updated, the product-service publishes a `product.updated` event to Kafka. A cache invalidation consumer listens for these events and clears the relevant cache entries.

```javascript
// consumers/cacheInvalidation.js
async function handleProductUpdated(event) {
  const { productId } = event.payload;

  // Delete the specific product cache
  await redis.del(`product-service:product:${productId}`);

  // Delete catalog page caches (we don't know which pages are affected)
  const catalogKeys = await redis.keys('product-service:catalog:page:*');
  if (catalogKeys.length > 0) {
    await redis.del(...catalogKeys);
  }

  logger.info('Cache invalidated for product update', { productId });
}
```

## Cache Failure Handling

Redis is treated as a non-critical dependency. If Redis is unavailable, services must continue to function by falling back to database queries. Cache operations should never cause a request to fail.

```javascript
async function getCachedUser(userId) {
  try {
    const cached = await redis.get(`user-service:user:${userId}`);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    logger.warn('Redis read failed, falling back to database', { err });
    metrics.increment('cache.redis.error');
  }

  // Fallback to database
  return db.users.findById(userId);
}
```

Monitor cache hit rates and Redis error rates in the Datadog `Redis Overview` dashboard. A sustained cache hit rate below 80% or Redis error rate above 1% should be investigated.

## Related Documents

- [Database Schema](database-schema.md)
- [Architecture Overview](architecture-overview.md)
- [Monitoring Runbook](monitoring-runbook.md)
- [Error Handling](error-handling.md)
