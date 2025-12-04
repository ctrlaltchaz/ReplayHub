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
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

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
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json

RUN npm ci --workspaces --include-workspace-root

# Build the API
FROM deps AS builder
ARG PRISMA_SCHEMA
ARG PRISMA_DB_URL
ENV DATABASE_URL=${PRISMA_DB_URL}
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .

# Generate Prisma client  
WORKDIR /app/apps/api

# Prisma needs @prisma/client available before generation
# Install it directly in the apps/api workspace directory
RUN npm install @prisma/client@6.19.0 --save --legacy-peer-deps

# Now generate the Prisma client
RUN npx prisma generate --schema=${PRISMA_SCHEMA}

RUN npm run build

# Final runtime image
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV ASSET_UPLOAD_DIR=/app/data

# Install openssl for Prisma
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

# Copy root node_modules and workspace structure
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/scripts ./apps/api/scripts

RUN mkdir -p ${ASSET_UPLOAD_DIR} /app/apps/api/logs \
  && chown -R nestjs:nodejs ${ASSET_UPLOAD_DIR} /app/apps/api/logs \
  && chmod +x /app/apps/api/scripts/*.sh 2>/dev/null || true

USER nestjs
WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/src/main.js"]
