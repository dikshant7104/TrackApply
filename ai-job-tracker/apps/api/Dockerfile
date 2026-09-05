# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci --workspace=apps/api --workspace=packages/shared

# Copy source
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

# Copy built output and production deps
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./package.json

# Create uploads dir
RUN mkdir -p uploads && chown node:node uploads

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
