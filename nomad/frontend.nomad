job "frontend" {
  datacenters = ["dc1"]
  type = "service"

  group "frontend" {
    count = 1

    network {
      port "http" {
        to = 80
        static = 80
      }
    }

    task "frontend" {
      driver = "docker"

      config {
        image = "lijomadassery/ecoa-frontend:latest"
        ports = ["http"]
      }

      resources {
        cpu    = 200
        memory = 256
      }

      service {
        name = "frontend"
        port = "http"
        check {
          type     = "http"
          path     = "/"
          interval = "10s"
          timeout  = "2s"
        }
      }

      template {
        data = <<EOH
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable error logging
    error_log /dev/stderr debug;
    access_log /dev/stdout;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # API proxy
    location /api/ {
        proxy_pass http://{{ range service "backend" }}{{ .Address }}:{{ .Port }}{{ end }}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Add error handling for proxy
        proxy_intercept_errors on;
        error_page 502 503 504 /50x.html;
    }

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOH
        destination = "local/nginx.conf"
      }
    }
  }
} 