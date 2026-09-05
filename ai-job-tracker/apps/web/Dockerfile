# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci --workspace=apps/web --workspace=packages/shared

COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web
RUN npm run build

# ─── Stage 2: Nginx ──────────────────────────────────────────────────────────
FROM nginx:alpine AS production

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
