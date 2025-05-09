#!/bin/sh
if [ "$USE_ENVSUBST" = "true" ]; then
  envsubst '${VITE_API_BASE_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
  mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf
fi
exec nginx -g 'daemon off;' 