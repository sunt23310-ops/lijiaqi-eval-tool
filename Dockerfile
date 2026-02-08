FROM node:20-alpine AS base

# ─── 后端构建 ─────────────────────
FROM base AS server-build
WORKDIR /app
COPY packages/server/package.json packages/server/tsconfig.json ./
RUN npm install
COPY packages/server/src ./src
COPY packages/server/prisma ./prisma
RUN npx tsc
RUN npx prisma generate

# ─── 前端构建 ─────────────────────
FROM base AS web-build
WORKDIR /app
COPY packages/web/package.json ./
RUN npm install
COPY packages/web/ ./
RUN npm run build

# ─── 后端运行 ─────────────────────
FROM base AS server
WORKDIR /app
COPY --from=server-build /app/node_modules ./node_modules
COPY --from=server-build /app/dist ./dist
COPY --from=server-build /app/prisma ./prisma
COPY packages/server/package.json ./
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

# ─── 前端 Nginx ───────────────────
FROM nginx:alpine AS web
COPY --from=web-build /app/dist /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
