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

# Copy the built assets to nginx
COPY dist/ /usr/share/nginx/html

# Copy your Nginx config with the env variable placeholder
COPY default.conf /etc/nginx/templates/default.conf.template

# Install envsubst (part of gettext)
RUN apk add --no-cache gettext

# Expose port 80
EXPOSE 80

# Use entrypoint to substitute env vars and start nginx
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"] 