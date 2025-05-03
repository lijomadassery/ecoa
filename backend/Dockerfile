# Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Install build dependencies and certificates
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    build-essential \
    python3 \
    curl && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm config set registry http://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm install

# Generate Prisma client before copying source code
COPY prisma ./prisma
ENV NODE_ENV=development
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and install ALL dependencies (including devDependencies)
COPY package*.json ./
RUN npm config set registry http://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm install

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy prisma schema and generate client
COPY prisma ./prisma
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npx prisma generate

# Run the seed script with ts-node
RUN npx ts-node prisma/seed.ts

# Prune devDependencies for production
RUN npm prune --production

# Set environment variables
ENV PORT=4001

# Expose the port
EXPOSE 4001

# Start the application
CMD ["node", "dist/index.js"] 