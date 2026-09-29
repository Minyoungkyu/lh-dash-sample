# ── build: 프론트(vite) 빌드 ──
FROM node:22-alpine AS build
WORKDIR /app
# 운영 VWorld 키(레퍼런스 키)를 빌드 시 주입 → 프론트 타일에 반영
ARG VITE_VWORLD_KEY
ENV VITE_VWORLD_KEY=$VITE_VWORLD_KEY
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── runtime: Node 서버(API + dist 서빙) ──
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY src/lib/mock ./src/lib/mock
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node", "server/index.js"]
