# Root Dockerfile for Railway - builds from backend directory
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm ci

# Development stage
FROM base AS development
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app

COPY backend/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

COPY backend/ ./

RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 5000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

