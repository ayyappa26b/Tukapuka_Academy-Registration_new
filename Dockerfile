# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
 FROM node:22-alpine AS deps
WORKDIR /app

# Prisma needs openssl for native query engine binaries
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci 

# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
 FROM node:22-alpine AS builder
WORKDIR /app

# openssl so `prisma generate` detects the Alpine/openssl-3 runtime correctly
RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client targeting the Alpine OpenSSL binary
RUN npx prisma generate

# ── NEXT_PUBLIC_* are inlined into the BROWSER bundle at build time ───────────
# They MUST be present when `next build` runs. Coolify supplies the two secrets
# as build args (see docs/canon/12-production-live-test-runbook.md §A3); the
# routing URLs default below. A missing publishable key here ⇒ Clerk cannot
# initialise in the browser and sign-in/sign-up break in production.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/after-sign-in
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/after-sign-in
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL \
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL \
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL \
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

# Build Next.js (standalone output configured in next.config.ts)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ─── Stage 3: Runner ──────────────────────────────────────────────────────────
 FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Standalone Next.js output + static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone  ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static      ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public            ./public

# Custom server + Prisma (needed at runtime for migrations & socket server)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules      ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma            ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/server.ts         ./server.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib               ./lib
COPY --from=builder --chown=nextjs:nodejs /app/package.json      ./package.json

USER nextjs

EXPOSE 4000
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Custom server boots Next.js + Socket.IO together
CMD ["node", "server.js"]
