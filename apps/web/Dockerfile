# syntax=docker/dockerfile:1
# Production image for @esports-ops/web (Next.js 14)

FROM node:20-slim AS base
WORKDIR /app

# Install all workspace dependencies (including dev) so we can build
FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY apps/api/package*.json ./apps/api/
COPY packages/ui/package*.json ./packages/ui/

RUN npm ci

# Build the shared UI package and the web app
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@esports-ops/ui
RUN npm run build --workspace=@esports-ops/web

# Final runtime image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

WORKDIR /app/apps/web
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
