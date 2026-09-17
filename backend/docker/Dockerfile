# ---------------------------------------------------------------------------
# One image definition for every backend workspace.
#
# All services share the same monorepo, dependency tree and build, so they are
# built once and told which entrypoint to run via the SERVICE build argument:
#
#   docker build -f backend/docker/Dockerfile --build-arg SERVICE=auth-service .
#
# Build context is the `backend/` directory.
# ---------------------------------------------------------------------------

# --- Stage 1: install dependencies and compile JavaScript -----------------
FROM node:20-alpine AS build

WORKDIR /app

# Prisma's query engine needs OpenSSL on Alpine.
RUN apk add --no-cache openssl

# Manifests are copied before the sources so that `npm ci` is only re-run when
# a dependency actually changes, not on every code edit.
COPY package.json package-lock.json* ./
COPY shared/package.json shared/
COPY database/package.json database/
COPY api-gateway/package.json api-gateway/
COPY auth-service/package.json auth-service/
COPY user-service/package.json user-service/
COPY registration-service/package.json registration-service/
COPY content-service/package.json content-service/
COPY gallery-service/package.json gallery-service/
COPY atlas-service/package.json atlas-service/
COPY events-service/package.json events-service/
COPY notification-service/package.json notification-service/

RUN npm install --no-audit --no-fund

COPY . .

# The client must exist before the services compile.
RUN npx prisma generate --schema database/prisma/schema.prisma
RUN npm run build --workspaces --if-present

# --- Stage 2: runtime -------------------------------------------------------
FROM node:20-alpine AS runtime

ARG SERVICE
ENV SERVICE=${SERVICE}
ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=build /app ./

# Run unprivileged; the node image already provides this user.
USER node

# SERVICE is not expanded by exec-form CMD, so the shell form is used to pick
# the right entrypoint at container start.
CMD node ${SERVICE}/dist/main.js
