# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Disable SSL verification
RUN npm config set strict-ssl false

# Install dependencies
RUN npm install --legacy-peer-deps

# Install the missing date-fns package
RUN npm install --legacy-peer-deps date-fns

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy your Nginx config with the env variable placeholder
COPY nginx.conf /etc/nginx/nginx.conf

# Install envsubst (part of gettext)
RUN apk add --no-cache gettext

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 