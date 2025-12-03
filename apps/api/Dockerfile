FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Copy package files
COPY package. json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package. json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN npm ci

# Downgrade Prisma to stable 5.x (6.x has WASM bugs)
RUN npm install prisma@5 @prisma/client@5

# Build stage
FROM base AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . . 

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build the API using npx
RUN cd apps/api && npx nest build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built files
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /workspace/node_modules ./node_modules

# Copy Prisma schema and generated client
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /workspace/node_modules/. prisma ./node_modules/.prisma

# Copy database migrations for TypeORM
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/src/database ./src/database

USER nestjs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/main"]
