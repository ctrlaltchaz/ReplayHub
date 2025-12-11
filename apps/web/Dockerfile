# syntax=docker/dockerfile:1
# Production image for @replayhub/web (Next.js 14)

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

COPY package*.json ./
COPY package-lock.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/
COPY packages/ui/package*.json ./packages/ui/
COPY apps/api/prisma ./apps/api/prisma

RUN npm ci --workspaces --include-workspace-root --include=dev

# Build the shared UI package and the web app
FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build --workspace=@esports-ops/ui
RUN npm run build --workspace=@replayhub/web

# Final runtime image
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy the standalone build
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy sharp binaries from builder (standalone mode puts dependencies in root node_modules)
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp

# Create cache directory with proper permissions for nextjs user
RUN mkdir -p /app/apps/web/.next/cache \
  && chown -R nextjs:nodejs /app/apps/web/.next/cache

WORKDIR /app/apps/web
USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "HOSTNAME=0.0.0.0 node server.js"]
