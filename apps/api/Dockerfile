FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Copy package files from monorepo root and workspaces
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/ui/package.json ./packages/ui/
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .

# Generate Prisma client
WORKDIR /workspace/apps/api
RUN npx prisma generate

# Build the API
WORKDIR /workspace
RUN npm run build --workspace=@esports-ops/api

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

# Copy database migration files and data source
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/src/database ./src/database

# Copy Prisma files for runtime
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /workspace/apps/api/src/generated ./src/generated

USER nestjs

EXPOSE 3000

ENV PORT=3000

# Run migrations then start the app
CMD ["sh", "-c", "npm run migration:run && node dist/main"]