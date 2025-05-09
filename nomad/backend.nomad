job "backend" {
  datacenters = ["dc1"]
  type = "service"

  group "backend" {
    count = 1

    network {
      port "http" {
        to = 4001
        static = 4001
      }
    }

    task "backend" {
      driver = "docker"

      config {
        image = "lijomadassery/ecoa-backend:latest"
        ports = ["http"]
      }

      env {
        DATABASE_URL = "mysql://ecoa:ecoa@mysql:3306/ecoa"
        NODE_ENV = "production"
        PORT = "4001"
        JWT_SECRET = "your-jwt-secret"
      }

      resources {
        cpu    = 500
        memory = 512
      }

      service {
        name = "backend"
        port = "http"
        check {
          type     = "http"
          path     = "/health"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
} 