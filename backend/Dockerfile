# ── Build stage ──────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

# Prisma 7 uses the pg driver adapter (no query-engine binary needed).
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# Generate the Prisma client (output: ./generated/prisma, gitignored) then build.
COPY . .
RUN npx prisma generate
RUN npm run build

# Drop dev dependencies for a lean runtime.
RUN npm prune --omit=dev

# ── Runtime stage ────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY package*.json ./

EXPOSE 3000

# Apply pending migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
