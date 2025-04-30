# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Update certificates and install dependencies
RUN apk update && \
    apk add --no-cache ca-certificates && \
    update-ca-certificates && \
    apk add --no-cache \
    openssl \
    openssl-dev \
    gcc \
    g++ \
    make \
    python3 \
    libc-dev

# Copy package files
COPY package*.json ./

# Configure npm
RUN npm config set strict-ssl false
RUN npm config set registry http://registry.npmjs.org/

# Install ALL dependencies (including devDependencies)
RUN npm install

# Generate Prisma client before copying source code
COPY prisma ./prisma
ENV PRISMA_BINARY_PLATFORM=linux-musl
ENV NODE_ENV=development
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Update certificates and install runtime dependencies
RUN apk update && \
    apk add --no-cache ca-certificates && \
    update-ca-certificates && \
    apk add --no-cache openssl

# Configure npm
RUN npm config set strict-ssl false
RUN npm config set registry http://registry.npmjs.org/

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy prisma schema and generate client
COPY prisma ./prisma
ENV PRISMA_BINARY_PLATFORM=linux-musl
ENV NODE_ENV=production
RUN npx prisma generate

# Set environment variables
ENV PORT=4001

# Expose the port
EXPOSE 4001

# Start the application
CMD ["node", "dist/index.js"] 