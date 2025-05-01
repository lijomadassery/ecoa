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

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 