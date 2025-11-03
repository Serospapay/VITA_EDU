# Root Dockerfile for Railway - builds from backend directory
FROM node:18-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Prisma generate will be done at runtime, so no DATABASE_URL needed during build
# DATABASE_URL will be provided by Railway Variables at container startup
ENV PRISMA_SKIP_POSTINSTALL_GENERATE="true"

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

# Generate Prisma client (needed for TypeScript compilation)
# prisma generate does NOT connect to database
RUN npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 5000

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app

COPY backend/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

COPY backend/ ./

# Generate Prisma client and build TypeScript code
# prisma generate does NOT connect to database - it only generates client from schema
# We still need it during build for TypeScript compilation
RUN npx prisma generate --schema=./prisma/schema.prisma && \
    npm run build && \
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

