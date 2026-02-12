# API Authentication

**Last updated:** 2025-01-10
**Owner:** Platform Engineering
**Status:** Current

## Overview

The Meridian Commerce platform uses two authentication mechanisms depending on the caller type:

1. **OAuth 2.0 with JWT tokens** for end-user authentication (web and mobile clients)
2. **API key authentication** for service-to-service communication

All authentication logic is centralized in the user-service. The API gateway validates tokens on every inbound request before forwarding to upstream services.

## OAuth 2.0 / JWT Authentication

### Token Lifecycle

The platform issues two types of tokens upon successful authentication:

| Token Type | Lifetime | Storage | Purpose |
|---|---|---|---|
| Access token | 15 minutes | In-memory only (client) | Authorizes API requests |
| Refresh token | 7 days | HttpOnly secure cookie | Obtains new access tokens |

Access tokens are signed JWTs (RS256) containing the user's identity and roles. They are intentionally short-lived to limit the window of exposure if a token is compromised. Clients must use the refresh token to obtain a new access token before the current one expires.

### Token Format

Access token payload:

```json
{
  "sub": "usr_01HQGX4N7RKZFJ3BVTM8P5WCDE",
  "email": "developer@meridiancommerce.io",
  "roles": ["member"],
  "iat": 1705234320,
  "exp": 1705235220,
  "iss": "meridian-user-service",
  "aud": "meridian-api"
}
```

### Authentication Endpoints

```
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

#### Login

```bash
curl -X POST https://api.meridiancommerce.io/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@meridiancommerce.io",
    "password": "correct-horse-battery-staple"
  }'
```

Response (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

The refresh token is set as an HttpOnly cookie in the response headers and should not be handled directly by client-side JavaScript.

#### Refresh

```bash
curl -X POST https://api.meridiancommerce.io/api/v1/auth/refresh \
  -H "Cookie: refresh_token=dGhpcyBpcyBhIHJlZnJlc2..."
```

If the refresh token is valid and not expired, a new access token is returned with the same payload structure as the login response. The refresh token itself is rotated on each use (one-time use tokens).

## Service-to-Service Authentication

Internal services authenticate with each other using API keys passed in the `X-Service-Key` header. These keys are stored in AWS Secrets Manager and injected as environment variables at container startup.

```bash
curl -X GET http://product-service:3003/internal/products/prod_01HQG... \
  -H "X-Service-Key: sk_svc_01HQGX4N7RKZFJ3BVTM8P5WCDE"
```

Service keys are scoped per calling service. The order-service has a different key than the notification-service, allowing fine-grained access control and auditability.

Internal endpoints are prefixed with `/internal/` and are not exposed through the API gateway.

## Route-Level Authorization

Controllers use decorators to declare authentication and authorization requirements:

| Decorator | Behavior |
|---|---|
| `@Public()` | No authentication required. Subject to anonymous rate limits. |
| `@RequireAuth()` | Valid access token required. Returns 401 if missing or expired. |
| `@RequireRole("admin")` | Valid token with the specified role required. Returns 403 if insufficient permissions. |
| `@RequireRole("admin", "member")` | Token must include at least one of the listed roles. |

Example usage in a controller:

```typescript
@RequireAuth()
@RequireRole("admin")
@Put("/api/v1/users/:id/roles")
async updateUserRoles(req: Request, res: Response) {
  // Only admins can modify user roles
  const { roles } = req.body;
  const updated = await this.userService.updateRoles(req.params.id, roles);
  return res.json(updated);
}
```

## Rate Limiting

Rate limits are enforced at the API gateway using a sliding window algorithm backed by Redis.

| Caller Type | Limit | Window | Scope |
|---|---|---|---|
| Authenticated user | 100 requests | 1 minute | Per user ID |
| Anonymous client | 20 requests | 1 minute | Per IP address |
| Service-to-service | 1000 requests | 1 minute | Per service key |

When a rate limit is exceeded, the gateway returns a `429 Too Many Requests` response with the following headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705235280
Retry-After: 32
```

## Error Codes

Authentication and authorization errors follow the standard error response format. For the full error taxonomy and handling guidelines, see [Error Handling](error-handling.md).

| HTTP Status | Error Code | Description |
|---|---|---|
| 401 | `AUTH_TOKEN_MISSING` | No access token provided |
| 401 | `AUTH_TOKEN_EXPIRED` | Access token has expired |
| 401 | `AUTH_TOKEN_INVALID` | Token signature verification failed |
| 401 | `AUTH_REFRESH_EXPIRED` | Refresh token has expired, user must re-authenticate |
| 403 | `AUTH_INSUFFICIENT_ROLE` | User does not have the required role |
| 429 | `RATE_LIMIT_EXCEEDED` | Caller has exceeded the rate limit for their tier |

## Related Documents

- [Architecture Overview](architecture-overview.md)
- [User API Endpoints](api-endpoints-users.md)
- [Order API Endpoints](api-endpoints-orders.md)
- [Local Development Setup](local-dev-setup.md)
