# Root Dockerfile for Railway - builds from backend directory
FROM node:18-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Set dummy DATABASE_URL globally for all stages (Prisma requires it during validation)
# Use a non-existent host to prevent actual connection attempts
# This is only used for schema validation, not actual connection
ENV DATABASE_URL="postgresql://user:password@127.0.0.1:9999/db?schema=public&connect_timeout=1"
ENV PRISMA_SKIP_POSTINSTALL_GENERATE="true"
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL="true"

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies (as root, then fix permissions)
# Skip scripts to avoid Prisma postinstall trying to connect to DB
# DATABASE_URL is inherited from base stage
RUN npm ci --ignore-scripts && \
    chmod -R 755 /app/node_modules

# Development stage
FROM base AS development
WORKDIR /app

COPY backend/package*.json ./
# Skip scripts during npm install
RUN npm ci --ignore-scripts

COPY backend/ ./

# Skip Prisma generate in development stage - will be done at runtime
# This avoids connection attempts during build

EXPOSE 5000

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app

COPY backend/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

COPY backend/ ./

# Build TypeScript code (skip Prisma generate - will be done at runtime)
# Prisma generate will happen at container startup with real DATABASE_URL
RUN npm run build && \
    chmod -R 755 /app/node_modules

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

# Generate Prisma client, run migrations and start server
# At runtime, DATABASE_URL from Railway Variables will be available
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm start"]

