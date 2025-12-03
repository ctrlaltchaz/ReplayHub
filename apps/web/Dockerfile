FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Copy package files from monorepo root and workspaces
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Disable husky and install dependencies
ENV HUSKY=0
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .

# Build-time environment variable for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Build the web app using root script
RUN npm run build:web

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /workspace/apps/web/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# Copy standalone server and static files
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# Start from the correct location for standalone build
CMD ["node", "apps/web/server.js"]