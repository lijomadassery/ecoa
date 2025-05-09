#!/bin/sh
if [ "$USE_ENVSUBST" = "true" ]; then
  envsubst '${VITE_API_BASE_URL}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp
  mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf
fi
exec nginx -g 'daemon off;' 