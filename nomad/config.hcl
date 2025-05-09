# Nomad server configuration
data_dir = "/opt/nomad/data"
bind_addr = "0.0.0.0"

server {
  enabled = true
  bootstrap_expect = 1
}

client {
  enabled = true
  servers = ["127.0.0.1:4647"]
}

plugin "docker" {
  config {
    allow_privileged = true
  }
}

ports {
  http = 4646
  rpc  = 4647
  serf = 4648
} 