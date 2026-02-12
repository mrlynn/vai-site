# User API Endpoints

**Last updated:** 2025-01-12
**Owner:** Identity Team
**Status:** Current

## Overview

The User API provides CRUD operations for managing user accounts, profiles, and role assignments. All endpoints are served by the user-service and are accessible through the API gateway at `https://api.meridiancommerce.io`.

For authentication requirements and token management, see [API Authentication](api-authentication.md).

## Base URL

```
/api/v1/users
```

## Endpoints

### List Users

Retrieves a paginated list of users. Uses cursor-based pagination for consistent results across concurrent writes.

```
GET /api/v1/users
```

**Auth:** `@RequireAuth()` `@RequireRole("admin", "member")`

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | (none) | Opaque cursor from a previous response for pagination |
| `limit` | integer | 20 | Number of results per page (max 100) |
| `role` | string | (none) | Filter by role: `admin`, `member`, `viewer` |
| `search` | string | (none) | Full-text search across name and email fields |
| `status` | string | `active` | Filter by account status: `active`, `suspended`, `deactivated` |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "usr_01HQGX4N7RKZFJ3BVTM8P5WCDE",
      "email": "jane.doe@meridiancommerce.io",
      "name": "Jane Doe",
      "role": "admin",
      "status": "active",
      "createdAt": "2024-11-02T08:15:00.000Z",
      "updatedAt": "2025-01-10T14:22:00.000Z"
    }
  ],
  "pagination": {
    "nextCursor": "eyJpZCI6InVzcl8wMUhRR1g0TjdSS1pGSjNC...",
    "hasMore": true,
    "total": 1247
  }
}
```

**Note:** Members can list users but only see basic profile fields (id, name, role). Admin users see the full user object including email, status, and timestamps.

### Get User by ID

Retrieves a single user by their unique identifier.

```
GET /api/v1/users/:id
```

**Auth:** `@RequireAuth()`

**Response (200 OK):**

```json
{
  "data": {
    "id": "usr_01HQGX4N7RKZFJ3BVTM8P5WCDE",
    "email": "jane.doe@meridiancommerce.io",
    "name": "Jane Doe",
    "role": "admin",
    "status": "active",
    "preferences": {
      "timezone": "America/New_York",
      "locale": "en-US",
      "notifications": {
        "email": true,
        "sms": false
      }
    },
    "createdAt": "2024-11-02T08:15:00.000Z",
    "updatedAt": "2025-01-10T14:22:00.000Z"
  }
}
```

Users can retrieve their own profile with any role. Retrieving another user's profile requires `admin` or `member` role.

### Create User

Creates a new user account. A `user.registered` event is published to Kafka upon successful creation, which triggers the notification-service to send a welcome email.

```
POST /api/v1/users
```

**Auth:** `@RequireAuth()` `@RequireRole("admin")`

**Request Body:**

```json
{
  "email": "new.user@meridiancommerce.io",
  "name": "New User",
  "role": "member",
  "sendInvite": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Must be a valid email, unique across all users |
| `name` | string | Yes | Display name (2 to 128 characters) |
| `role` | string | No | One of `admin`, `member`, `viewer`. Defaults to `viewer`. |
| `sendInvite` | boolean | No | If true, sends a password setup email. Defaults to `true`. |

**Response (201 Created):**

Returns the full user object with the generated ID.

### Update User

Updates an existing user's profile or role.

```
PUT /api/v1/users/:id
```

**Auth:** `@RequireAuth()`

Users can update their own `name` and `preferences`. Only admins can update `role` and `status` for any user.

**Request Body (partial update):**

```json
{
  "name": "Jane Smith",
  "preferences": {
    "timezone": "America/Chicago"
  }
}
```

**Response (200 OK):**

Returns the updated user object.

### Delete User

Soft-deletes a user account by setting the status to `deactivated`. The user's data is retained for 90 days before permanent deletion by a scheduled cleanup job.

```
DELETE /api/v1/users/:id
```

**Auth:** `@RequireAuth()` `@RequireRole("admin")`

**Response (204 No Content)**

## Permissions Model

The platform uses a role-based access control (RBAC) model with three built-in roles:

| Role | Capabilities |
|---|---|
| `admin` | Full access to all resources. Can manage users, roles, and system settings. |
| `member` | Can create and manage orders, view products, and manage their own profile. |
| `viewer` | Read-only access to products and their own profile. Cannot create orders. |

Role inheritance is not supported. Each role defines an explicit set of permissions. Roles are assigned at the user level and included in the JWT access token for stateless authorization checks.

## Error Responses

All error responses follow the standard envelope format:

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "No user found with ID usr_01HQGX4N7RKZFJ3BVTM8P5WCDE",
    "status": 404
  }
}
```

Common error codes for user endpoints:

| Code | Status | Description |
|---|---|---|
| `USER_NOT_FOUND` | 404 | The specified user ID does not exist |
| `USER_EMAIL_CONFLICT` | 409 | A user with this email address already exists |
| `USER_VALIDATION_ERROR` | 422 | Request body failed validation |
| `AUTH_INSUFFICIENT_ROLE` | 403 | Caller does not have permission for this operation |

## Testing

For guidance on writing integration tests against these endpoints, including test fixtures and authentication helpers, see [Testing Strategy](testing-strategy.md).

## Related Documents

- [API Authentication](api-authentication.md)
- [Order API Endpoints](api-endpoints-orders.md)
- [Database Schema](database-schema.md)
