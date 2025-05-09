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
    }
  }
} 