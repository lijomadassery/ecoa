job "mysql" {
  datacenters = ["dc1"]
  type = "service"

  group "mysql" {
    count = 1

    network {
      port "mysql" {
        to = 3306
        static = 3306
      }
    }

    volume "mysql_data" {
      type      = "host"
      source    = "mysql_data"
      read_only = false
    }

    task "mysql" {
      driver = "docker"

      config {
        image = "mysql:8.0"
        ports = ["mysql"]
        volumes = [
          "mysql_data:/var/lib/mysql"
        ]
      }

      env {
        MYSQL_ROOT_PASSWORD = "rootpassword"
        MYSQL_DATABASE = "ecoa"
        MYSQL_USER = "ecoa"
        MYSQL_PASSWORD = "ecoa"
      }

      resources {
        cpu    = 500
        memory = 1024
      }

      service {
        name = "mysql"
        port = "mysql"
        check {
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
} 