# Backend

NestJS microservices behind a single API Gateway, sharing one PostgreSQL
database through Prisma.

```
                 React (frontend/)
                        │
                        │ HTTP/REST — the only public surface
                        ▼
              ┌───────────────────┐
              │    api-gateway    │  :5050  REST + Swagger + JWT guards
              └─────────┬─────────┘
                        │ TCP (@nestjs/microservices)
   ┌──────────┬─────────┼─────────┬──────────┬──────────┬──────────┐
   ▼          ▼         ▼         ▼          ▼          ▼          ▼
  auth      user   registration content   gallery    atlas     events
 :5001     :5002      :5003      :5004     :5005     :5006     :5007
                        │                                  notification :5008
                        ▼
              ┌───────────────────┐
              │    PostgreSQL     │  via @dpgc/database (Prisma)
              └───────────────────┘
```

## Layout

This is an npm workspace. One `npm install` at this level installs everything
and links the shared packages.

```
backend/
├── api-gateway/            the only service the browser talks to
├── auth-service/           credentials, JWT issuance, password reset
├── user-service/           users, roles, permissions, departments, audit
├── registration-service/   diaspora sign-ups and committee applications
├── content-service/        articles, editorial workflow, taxonomy
├── gallery-service/        committee media, moderation, albums
├── atlas-service/          geo-located pandal entries
├── events-service/         webinars, RSVPs, push subscriptions
├── notification-service/   email and web-push delivery with an outbox
├── database/               Prisma schema, migrations, seed, PrismaService
├── shared/                 constants, interfaces, decorators, utils, filters
├── docker/                 the Dockerfile all services are built from
└── .env / .env.example
```

### Why these services, and no more

Each one owns a business domain found in the original application. Domains that
are always read and written together were kept together rather than split for
the sake of it:

- `content-service` owns both articles and the shared taxonomy, because every
  article write touches a category.
- `gallery-service` owns media and albums; an album is meaningless without the
  media it contains.
- `user-service` owns RBAC as well as users, since a role change is a user
  change and both write `audit_logs`.

## Shared packages

Two workspaces are consumed by the rest as libraries, and both must be built
before the services that import them — `npm run build` does this in order.

### `@dpgc/shared`

Anything two services would otherwise duplicate:

| Export | Purpose |
| --- | --- |
| `SERVICE_TOKENS`, `*_PATTERNS` | Every TCP message pattern as a typed constant, so a mistyped pattern is a compile error rather than a silent timeout. |
| `PERMISSIONS`, `ROLES` | The permission and role definitions, ported from the Laravel seeder. |
| `ApiResponse`, `PaginationMeta` | The response envelope contract. |
| `JwtPayload`, `AuthenticatedUser` | Token claims, so the gateway can authorise locally. |
| `@Public`, `@Roles`, `@RequirePermissions`, `@CurrentUser` | Route metadata read by the gateway guards. |
| `ServiceException` | Structured errors that survive the TCP boundary. |
| `ServiceExceptionFilter` | Serialises those errors on the way out of a microservice. |
| `translatePrismaError` | Turns a Prisma error code into a safe message. |
| `paginate`, `slugify`, `uniqueSlug` | Shared helpers. |

### `@dpgc/database`

Owns the Prisma schema and exposes `PrismaService` plus `PrismaModule`, which is
`@Global()`, so importing it once in a service's `AppModule` makes the client
injectable everywhere in that service.

## Running it

```bash
cd backend
npm install
npm run prisma:generate      # required before the first build
npm run dev                  # gateway + all eight services, one terminal
```

`npm run dev:core` starts only the gateway, auth and user services, which is
enough for sign-in and user administration and much lighter on memory.

Individual services:

```bash
npm run start:gateway
npm run start:auth
npm run start:user
npm run start:registration
npm run start:content
npm run start:gallery
npm run start:atlas
npm run start:events
npm run start:notification
```

Each of those runs `nest start --watch` in that workspace, so a service can be
restarted without touching the others.

### Ports

| Service | Port | Transport |
| --- | --- | --- |
| api-gateway | 5050 | HTTP |
| auth-service | 5001 | TCP |
| user-service | 5002 | TCP |
| registration-service | 5003 | TCP |
| content-service | 5004 | TCP |
| gallery-service | 5005 | TCP |
| atlas-service | 5006 | TCP |
| events-service | 5007 | TCP |
| notification-service | 5008 | TCP |
| PostgreSQL | 5000 | — |

All of these come from `.env`. Two notes on the numbers:

- The specification assigns the gateway port 5000, but **PostgreSQL already
  listens on 5000 on this machine**, so the gateway uses 5050. Change
  `GATEWAY_PORT` if your PostgreSQL is on the usual 5432, and update
  `VITE_API_URL` in `frontend/.env` to match.
- The microservice ports are TCP listeners for internal traffic only. They are
  never sent to the browser, and nothing outside this network should reach them.

## How a request flows

`GET /api/v1/users` illustrates the whole path:

1. The browser sends the request to the gateway with `Authorization: Bearer …`.
2. `JwtAuthGuard` verifies the signature locally — no call to `auth-service`,
   because the token already carries the roles and permission keys — and
   attaches an `AuthenticatedUser` to the request.
3. `PermissionsGuard` reads `@RequirePermissions('view_users')` from the route
   and compares it against those claims, returning 403 if it does not hold.
4. `UsersController` calls `MicroserviceClient.send(USER_SERVICE, 'user.list', …)`.
5. `user-service` handles the `@MessagePattern`, validates the payload against a
   DTO, queries Prisma and returns rows plus pagination metadata.
6. `ResponseInterceptor` wraps the result in the envelope and moves pagination
   into `meta`.

Controllers only translate HTTP into a message and back. All business logic
lives in the services.

## Error handling

Errors keep their meaning across the TCP boundary, which is the part that is
easy to get wrong:

1. A microservice throws `ServiceException.notFound('User')`.
2. `ServiceExceptionFilter` serialises it to `{ statusCode, code, message }`.
3. `MicroserviceClient` recognises that payload and rethrows it as the matching
   `HttpException`.
4. `AllExceptionsFilter` renders it as the standard error envelope.

The result is that a missing row becomes a genuine 404 with a readable message,
rather than a 500 from a broken RPC call.

Prisma errors never reach the client directly. `translatePrismaError` maps them
first — a unique-constraint violation (`P2002`) becomes
`409 Conflict: "A user with this email already exists."` — so no table names,
column names or SQL fragments are exposed.

Every response uses one shape:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [],
  "meta": { "pagination": { "page": 1, "perPage": 15, "total": 42, "lastPage": 3 } },
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/v1/users"
}
```

```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "error": { "code": "NOT_FOUND", "statusCode": 404 },
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/v1/users/999"
}
```

Status codes in use: 400 validation, 401 missing or expired token, 403
insufficient permission, 404 missing resource, 409 conflict, 422 business-rule
violation, 429 throttled, 500 unexpected.

## Authentication and authorisation

`auth-service` issues a short-lived access token and a longer-lived refresh
token. Refresh tokens are persisted in `refresh_tokens`, so signing out revokes
the session server-side instead of trusting the client to forget it.

Access tokens carry `sub`, `email`, `roles` and `permissions`. That is what lets
the gateway authorise without a round trip per request; the cost is that a
permission change only takes effect for a user once their token is refreshed.

Authorisation is by permission key, not role name:

```javascript
@Get()
@RequirePermissions(PERMISSIONS.VIEW_USERS)
async list(@Query() query: ListUsersDto) { … }
```

`@Roles()` and `RolesGuard` exist for the cases where a role genuinely is the
rule, but permissions are preferred: roles can then be reorganised without
touching any route. Super Admin passes every check.

Passwords are bcrypt at 12 rounds. Hashes written by the old Laravel app use the
`$2y$` prefix, which `bcryptjs` cannot read; `TokenService` detects those on a
successful sign-in and silently re-hashes, so existing accounts keep working.

## Swagger

Enabled on the gateway only — the microservices have no HTTP surface to
document:

```
http://localhost:5050/api/docs
```

`persistAuthorization` is on, so a token pasted into **Authorize** survives a
page reload.

## Adding a service

1. Copy an existing service directory; the smallest is `atlas-service`.
2. Add the workspace to `backend/package.json` and give it a `start:*` script.
3. Declare its patterns in `shared/src/constants/patterns.js`.
4. Register its client in `api-gateway/src/clients/clients.module.js` and add
   its host and port to `.env` and `config/services.config.js`.
5. Add a controller to the gateway that forwards to it.

## Testing

```bash
npm test                     # every workspace that defines tests
npm test --workspace @dpgc/auth-service
```

The gateway exposes two probes that are useful on their own:

```bash
curl http://localhost:5050/api/v1/health            # is the gateway up
curl http://localhost:5050/api/v1/health/services   # can it reach each service
```

`/health/services` pings every microservice over TCP and reports each one
individually, which turns "the app is broken" into "gallery-service is down".
