# ---- Stage 1: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace root files needed for npm ci
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/

# Install all deps (dev included — needed for nest build)
RUN npm ci --workspace=apps/api

# Copy API source code
COPY apps/api/ apps/api/

# Build the NestJS app
RUN npm run build --workspace=apps/api

# ---- Stage 2: Production ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace root files needed for npm ci
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/

# Install production deps only
RUN npm ci --omit=dev --workspace=apps/api

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist apps/api/dist

# Use non-root user (built into node alpine image)
USER node

EXPOSE 3000

CMD ["node", "apps/api/dist/src/main"]
