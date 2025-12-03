# syntax=docker/dockerfile:1
# Production image for @esports-ops/api (NestJS + Prisma)

ARG PRISMA_SCHEMA=prisma/schema.prisma
ARG PRISMA_DB_URL=postgresql://postgres:postgres@localhost:5432/postgres

FROM node:22-slim AS base
WORKDIR /app

# Install all workspace dependencies (including dev) so we can build
FROM base AS deps
ARG PRISMA_DB_URL
ENV DATABASE_URL=${PRISMA_DB_URL}

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Align npm to 10.9.3 to match local tooling and install Nest CLI globally
RUN npm install -g npm@10.9.3 @nestjs/cli
ENV PATH="/usr/local/bin:/app/node_modules/.bin:/app/apps/api/node_modules/.bin:${PATH}"

COPY package*.json ./
COPY package-lock.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/ui/package*.json ./packages/ui/
COPY apps/api/prisma ./apps/api/prisma

RUN npm ci --workspaces --include-workspace-root
# Ensure Prisma client is present in the API workspace (local node_modules)
RUN npm --prefix /app/apps/api install @prisma/client --omit=dev --no-save

# Build the API
FROM deps AS builder
ARG PRISMA_SCHEMA
ARG PRISMA_DB_URL
ENV DATABASE_URL=${PRISMA_DB_URL}
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
WORKDIR /app/apps/api
RUN nest --version
RUN npm exec prisma generate -- --schema=${PRISMA_SCHEMA}
RUN npm run build

# Trim dev dependencies for the runtime image
FROM builder AS prune
ENV NODE_ENV=production
WORKDIR /app
RUN npm prune --omit=dev

# Final runtime image
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV ASSET_UPLOAD_DIR=/app/data

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY --from=prune /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

RUN mkdir -p ${ASSET_UPLOAD_DIR} && chown -R nestjs:nodejs ${ASSET_UPLOAD_DIR}

USER nestjs
WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main"]
