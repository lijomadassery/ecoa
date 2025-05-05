I'll update the documentation with the current information about your Grafana service:

# Monitoring Stack Setup in Minikube: Troubleshooting and Resolution

## Summary

We successfully set up a complete monitoring stack in a Minikube Kubernetes cluster, overcoming SSL certificate verification issues and image configuration problems. The stack includes Grafana for visualization, Prometheus for metrics collection, Loki for log aggregation, and Promtail for log collection from nodes.

## Access URLs for Monitoring Tools

### 1. Grafana
Grafana is already exposed as a LoadBalancer service in your environment:
```bash
# Grafana service details
Service Name: grafana
Type: LoadBalancer
Internal IP: 10.108.161.51
External IP: 127.0.0.1 (localhost)
Port: 80, mapped to NodePort 31676
```

Access Grafana at: `http://127.0.0.1:31676`

Alternative access methods:
```bash
# Use minikube service command to open in browser
minikube service grafana -n monitoring
```

Default login credentials:
- Username: admin
- Password: admin (on first login, you'll be prompted to change it)

If a custom password was set, retrieve it with:
```bash
kubectl get secret -n monitoring grafana-admin -o jsonpath='{.data.password}' | base64 -d
```

### 2. Prometheus
```bash
# Check if Prometheus service exists
kubectl get svc -n monitoring | grep prometheus

# If needed, create a service
kubectl expose deployment prometheus --type=NodePort --port=9090 -n monitoring

# Get service details
kubectl get svc prometheus -n monitoring
```

### 3. Loki
Loki is typically accessed through Grafana rather than directly, but you can expose it if needed:
```bash
# Check if Loki service exists
kubectl get svc -n monitoring | grep loki

# If needed, create a service
kubectl expose deployment loki --type=NodePort --port=3100 -n monitoring
```

## Detailed Process Documentation

### Initial Assessment

1. **Environment Verification**
   - Confirmed Minikube status was running correctly
   - Verified Kubernetes version (v1.32.0 server)
   - Confirmed FluxCD was properly installed (v2.5.1)

2. **Monitoring Stack Status Check**
   - Discovered all monitoring pods were in error states
   - Identified two distinct error types:
     - `ImagePullBackOff` for Grafana and Prometheus
     - `ErrImageNeverPull` for Loki and Promtail

3. **Root Cause Analysis**
   - Found that Grafana and Prometheus images couldn't be pulled due to certificate verification issues
   - Discovered Loki and Promtail were configured to use local images (`loki:local` and `promtail:local`) that didn't exist
   - Identified permission issues with Loki's directory structure

### Step-by-Step Resolution

1. **SSL Certificate Trust Fix**
   - Created directories for Docker certificates in Minikube
   ```bash
   minikube ssh "sudo mkdir -p /etc/docker/certs.d/registry-1.docker.io"
   ```
   - Copied host CA certificates to Minikube
   ```bash
   minikube cp /etc/ssl/certs/ca-certificates.crt /tmp/ca-certificates.crt
   ```
   - Installed certificates in the correct locations
   ```bash
   minikube ssh "sudo cp /tmp/ca-certificates.crt /etc/docker/certs.d/registry-1.docker.io/ca.crt"
   minikube ssh "sudo cp /tmp/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt"
   ```
   - Restarted Docker service
   ```bash
   minikube ssh "sudo systemctl restart docker"
   ```

2. **Grafana and Prometheus Fix**
   - Verified images could now be pulled correctly
   ```bash
   minikube ssh -- docker pull grafana/grafana:10.0.0
   minikube ssh -- docker pull prom/prometheus:v2.45.0
   ```
   - Both Grafana and Prometheus pods started running correctly after the certificate issue was resolved

3. **Promtail Fix**
   - Updated Promtail to use the official Docker image
   ```yaml
   image: grafana/promtail:2.9.2
   imagePullPolicy: IfNotPresent
   ```
   - Applied the updated DaemonSet configuration
   ```bash
   kubectl apply -f promtail-daemonset-updated.yaml
   ```

4. **Loki Fix**
   - Created a minimal configuration for Loki
   ```yaml
   auth_enabled: false
   server:
     http_listen_port: 3100
   ingester:
     lifecycler:
       ring:
         kvstore:
           store: inmemory
         replication_factor: 1
   ```
   - Used the official Docker image
   ```yaml
   image: grafana/loki:2.9.2
   ```
   - Set correct security context to avoid permission issues
   ```yaml
   securityContext:
     runAsUser: 0
   ```
   - Applied the deployment and service
   ```bash
   kubectl apply -f loki-minimal-config.yaml
   kubectl apply -f loki-final-deployment.yaml
   kubectl apply -f loki-service.yaml
   ```

### Key Learnings

1. **SSL Certificate Management in Minikube**
   - WSL Ubuntu and Minikube environments require proper CA certificate configuration
   - Docker in Minikube needs certificates installed in specific locations
   - Pattern observed: SSL certificate issues affected both FluxCD and Docker image pulls

2. **Container Image Strategies**
   - Local images require building and loading into Minikube
   - Public images work best when SSL certificate trust is properly configured
   - Always use full image paths with version tags for reliability

3. **Permission Handling**
   - Container processes need appropriate permissions to write to volumes
   - Using `runAsUser: 0` (root) for testing environments can bypass permission issues
   - Production environments should use proper security contexts with non-root users

## Data Source Configuration in Grafana

After accessing Grafana at http://127.0.0.1:31676, configure data sources:

1. **Add Prometheus Data Source**
   - URL: `http://prometheus:9090`
   - Access: `Server`

2. **Add Loki Data Source**
   - URL: `http://loki:3100`
   - Access: `Server`

This setup provides:
- Real-time metrics monitoring via Prometheus
- Centralized log aggregation via Loki
- Unified visualization through Grafana dashboards

The monitoring stack is now fully operational and ready for use.