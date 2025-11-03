# Root Dockerfile for Railway - builds from backend directory
FROM node:18-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Set dummy DATABASE_URL globally for all stages (Prisma requires it during validation)
# This is only used for schema validation, not actual connection
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
ENV PRISMA_SKIP_POSTINSTALL_GENERATE="true"

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies (as root, then fix permissions)
# DATABASE_URL is inherited from base stage
RUN npm ci && \
    chmod -R 755 /app/node_modules

# Development stage
FROM base AS development
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

# Generate Prisma client (skip validation)
# DATABASE_URL is inherited from base stage but won't be used for connection
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 5000

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app

COPY backend/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

COPY backend/ ./

# Generate Prisma and build (as root)
# Generate Prisma client (skip validation to avoid connection attempt)
# DATABASE_URL is inherited from base stage but won't be used for connection
RUN npx prisma generate --schema=./prisma/schema.prisma && \
    npm run build && \
    chmod -R 755 /app/node_modules/@prisma

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user BEFORE copying files
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# Copy necessary files
COPY --chown=expressjs:nodejs backend/package*.json ./
COPY --chown=expressjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=expressjs:nodejs --from=builder /app/dist ./dist
COPY --chown=expressjs:nodejs --from=builder /app/prisma ./prisma

# Fix permissions for Prisma
RUN chmod -R 755 /app/node_modules/@prisma 2>/dev/null || true

USER expressjs

EXPOSE 5000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

