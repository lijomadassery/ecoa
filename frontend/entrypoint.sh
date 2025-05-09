#!/bin/sh

# Install wget for health check
apk add --no-cache wget

# Wait for backend service
until wget -q --spider http://backend:4001/api/health; do
  echo "Waiting for backend service..."
  sleep 1
done

echo "Backend service is up!"

# Start nginx
nginx -g "daemon off;" 