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
FROM nginx:alpine

# Copy the built assets to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration
RUN echo 'server { \n\
    listen 80; \n\
    server_name _; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    \n\
    # Gzip compression \n\
    gzip on; \n\
    gzip_vary on; \n\
    gzip_min_length 10240; \n\
    gzip_proxied expired no-cache no-store private auth; \n\
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript; \n\
    gzip_disable "MSIE [1-6]\\."; \n\
    \n\
    # Cache static assets \n\
    location /assets/ { \n\
        expires 1y; \n\
        add_header Cache-Control "public, no-transform"; \n\
    } \n\
    \n\
    # Handle SPA routing \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
        expires -1; \n\
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 