# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies (including devDependencies for build)
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Use npm ci for cleaner installs if using package-lock.json
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client (needed for build type checking)
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --omit=dev

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY .env ./.env # Copy .env file - might need adjustment based on production strategy

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application and apply migrations
# Note: Applying migrations on startup might not be ideal for all production scenarios.
# Consider running migrations as a separate step in your deployment pipeline.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]