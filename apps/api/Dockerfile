# syntax=docker/dockerfile:1
# Production image for @esports-ops/api (NestJS + Prisma)

FROM node:20-slim AS base
WORKDIR /app

# Install all workspace dependencies (including dev) so we can build
FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/ui/package*.json ./packages/ui/

RUN npm ci

# Build the API
FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=@esports-ops/api

# Trim dev dependencies for the runtime image
FROM builder AS prune
ENV NODE_ENV=production
RUN npm prune --omit=dev

# Final runtime image
FROM node:20-slim AS runner
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
