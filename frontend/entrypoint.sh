#!/bin/sh

# Wait for backend service
until nslookup backend > /dev/null 2>&1; do
  echo "Waiting for backend service..."
  sleep 1
done

# Start nginx
nginx -g "daemon off;" 