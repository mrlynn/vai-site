# Error Handling Patterns

**Last updated:** 2025-01-21
**Owner:** Platform Engineering
**Status:** Current

## Overview

Consistent error handling across all Meridian Commerce services ensures that clients receive predictable, actionable error responses and that engineers can debug issues efficiently. This document defines the standard error format, error code taxonomy, retry strategies, and circuit breaker patterns used across the platform.

For authentication-specific error codes and flows, see [API Authentication](api-authentication.md).

## Standard Error Response Format

All API errors return a JSON response with the following structure:

```json
{
  "error": {
    "code": "VALIDATION_003",
    "message": "Invalid email format",
    "requestId": "req_01HRK9M4BXYZ7N3FWPQ2JTEA56",
    "details": {
      "field": "email",
      "value": "not-an-email",
      "constraint": "Must be a valid email address"
    }
  }
}
```

### Field Descriptions

| Field | Required | Description |
|-------|----------|-------------|
| `code` | Yes | Machine-readable error code from the taxonomy below |
| `message` | Yes | Human-readable description of the error, suitable for logging |
| `requestId` | Yes | Unique identifier for this request, used for tracing in Datadog |
| `details` | No | Additional context, varies by error type. May include field names, constraints, or upstream service info |

The `requestId` is generated at the API gateway and propagated through all downstream services via the `X-Request-Id` header. Always include this value in bug reports and support tickets.

## Error Code Taxonomy

Error codes follow the pattern `CATEGORY_NNN` where the category identifies the domain and the number identifies the specific error within that domain.

### AUTH (001-099): Authentication and Authorization

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_001 | 401 | Missing or malformed Authorization header |
| AUTH_002 | 401 | JWT token has expired |
| AUTH_003 | 401 | JWT signature validation failed |
| AUTH_004 | 403 | Insufficient permissions for this resource |
| AUTH_005 | 403 | Account has been suspended |
| AUTH_006 | 429 | Too many authentication attempts |

### VALIDATION (001-099): Input Validation

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_001 | 400 | Required field is missing |
| VALIDATION_002 | 400 | Field value is out of allowed range |
| VALIDATION_003 | 400 | Invalid format (email, phone, URL, etc.) |
| VALIDATION_004 | 400 | Request body exceeds maximum size |
| VALIDATION_005 | 400 | Invalid enum value |
| VALIDATION_006 | 422 | Business rule violation (e.g., order quantity exceeds inventory) |

### RESOURCE (001-099): Resource Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| RESOURCE_001 | 404 | Resource not found |
| RESOURCE_002 | 409 | Resource already exists (duplicate) |
| RESOURCE_003 | 409 | Conflict due to concurrent modification (stale ETag) |
| RESOURCE_004 | 410 | Resource has been permanently deleted |
| RESOURCE_005 | 423 | Resource is locked by another operation |

### SYSTEM (001-099): Internal and Infrastructure

| Code | HTTP Status | Description |
|------|-------------|-------------|
| SYSTEM_001 | 500 | Unhandled internal error |
| SYSTEM_002 | 503 | Database connection unavailable |
| SYSTEM_003 | 503 | Downstream service timeout |
| SYSTEM_004 | 503 | Kafka producer failed to publish event |
| SYSTEM_005 | 503 | Redis cache unavailable (non-fatal, service degrades gracefully) |
| SYSTEM_010 | 503 | Feature disabled via kill switch |

## Error Handling Middleware

Each service uses a centralized error handling middleware that catches all errors and formats them consistently:

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  const requestId = req.headers['x-request-id'] || generateRequestId();

  if (err instanceof AppError) {
    return res.status(err.httpStatus).json({
      error: {
        code: err.code,
        message: err.message,
        requestId,
        details: err.details || undefined,
      },
    });
  }

  // Unhandled errors
  logger.error('Unhandled error', { error: err, requestId });
  return res.status(500).json({
    error: {
      code: 'SYSTEM_001',
      message: 'An internal error occurred',
      requestId,
    },
  });
}
```

## Retry Logic

When calling downstream services, use exponential backoff with jitter to avoid thundering herd problems.

### Configuration

| Parameter | Value |
|-----------|-------|
| Max retries | 3 |
| Base delay | 100ms |
| Max delay | 5000ms |
| Jitter | Random 0-100ms added to each delay |

### Implementation

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries || !isRetryable(err)) {
        throw err;
      }
      const baseDelay = Math.min(100 * Math.pow(2, attempt), 5000);
      const jitter = Math.random() * 100;
      await sleep(baseDelay + jitter);
    }
  }
}

function isRetryable(err) {
  // Retry on network errors and 5xx responses
  // Do NOT retry on 4xx (client errors)
  return err.isNetworkError || (err.status >= 500 && err.status < 600);
}
```

## Circuit Breaker Pattern

For downstream service calls that may fail repeatedly, we use the circuit breaker pattern via the `opossum` library. This prevents cascading failures by short-circuiting calls to unhealthy services.

### Configuration

```javascript
const CircuitBreaker = require('opossum');

const breaker = new CircuitBreaker(callDownstreamService, {
  timeout: 3000,          // 3 second timeout per call
  errorThresholdPercentage: 50, // Open circuit if 50% of calls fail
  resetTimeout: 30000,    // Try again after 30 seconds
  volumeThreshold: 10,    // Minimum calls before circuit can trip
});

breaker.fallback(() => {
  return { data: null, fromCache: true, degraded: true };
});

breaker.on('open', () => {
  logger.warn('Circuit breaker opened for downstream-service');
  metrics.increment('circuit_breaker.open', { service: 'downstream-service' });
});
```

### Circuit States

| State | Behavior |
|-------|----------|
| Closed | All requests pass through normally |
| Open | All requests immediately fail with fallback response |
| Half-Open | A single test request is allowed through to check recovery |

When a circuit opens, the service should degrade gracefully. For example, the product-service returns cached catalog data when the pricing service circuit is open.

## Related Documents

- [API Authentication](api-authentication.md)
- [Architecture Overview](architecture-overview.md)
- [Monitoring Runbook](monitoring-runbook.md)
- [Caching Strategy](caching-strategy.md)
