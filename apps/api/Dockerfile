FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .

# Delete existing Prisma client and regenerate
WORKDIR /workspace/apps/api
RUN rm -rf ../../node_modules/. prisma ../../node_modules/@prisma/client
RUN npm install @prisma/client
RUN npx prisma generate
WORKDIR /workspace

# Build the API (from root)
RUN npm run build:api

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
