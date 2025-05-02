# Kubernetes Setup and Configuration Guide

## Overview
This document details the Kubernetes setup for the ECOA project, including local development environment, service configuration, and deployment strategies.

## Local Development Environment

### Prerequisites
- Minikube v1.32.0+
- Docker Desktop
- kubectl v1.28.0+

### Initial Setup
```bash
# Start Minikube
minikube start --driver=docker

# Verify cluster status
minikube status
```

## Namespace Configuration
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-app
```

## Service Configuration

### Frontend Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: my-app
spec:
  selector:
    app: frontend
  ports:
    - port: 8080
      targetPort: 80
  type: LoadBalancer
```

### Backend Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: my-app
spec:
  selector:
    app: backend
  ports:
    - port: 4001
      targetPort: 4001
  type: ClusterIP
```

## Deployment Configuration

### Frontend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: frontend:local
        imagePullPolicy: Never
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
        ports:
        - containerPort: 80
```

### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: backend:local
        imagePullPolicy: Never
        ports:
        - containerPort: 4001
```

## Local Access Configuration

### LoadBalancer Access
1. Start Minikube tunnel:
```bash
minikube tunnel
```

2. Access services:
- Frontend: http://127.0.0.1:8080
- Backend: Internal access via backend:4001

### Port Forwarding (Alternative)
```bash
# Forward frontend service
kubectl port-forward -n my-app service/frontend 8080:80

# Forward backend service (if needed)
kubectl port-forward -n my-app service/backend 4001:4001
```

## Resource Management

### Resource Limits
- Frontend:
  - CPU: 500m (half core)
  - Memory: 512Mi
  - Requests: 200m CPU, 256Mi memory

### Storage Configuration
- MySQL PVC configuration
- Local storage for development
- Persistent volume setup

## Monitoring and Debugging

### Health Checks
```bash
# Check pod status
kubectl get pods -n my-app

# Check service status
kubectl get services -n my-app

# Check deployments
kubectl get deployments -n my-app
```

### Logs and Debugging
```bash
# Get pod logs
kubectl logs -n my-app deployment/frontend
kubectl logs -n my-app deployment/backend

# Describe resources
kubectl describe pod -n my-app <pod-name>
kubectl describe service -n my-app <service-name>
```

## Best Practices

### Security
1. Resource Limits and Quotas
   - Set appropriate CPU and memory limits for all containers
   - Configure resource requests based on actual usage patterns
   - Implement namespace quotas to prevent resource exhaustion
   - Monitor resource usage and adjust limits accordingly
   - Use horizontal pod autoscaling for dynamic workloads

2. Image Security
   - Use local images with explicit tags for development
   - Never use 'latest' tag in production
   - Implement proper image versioning strategy
   - Configure image pull policies appropriately
   - Regularly update base images for security patches

3. Pod Security
   - Configure security contexts for pods and containers
   - Run containers as non-root users when possible
   - Use read-only root filesystems where applicable
   - Implement pod security policies
   - Configure appropriate Linux capabilities

4. Secret Management
   - Use Kubernetes Secrets for sensitive data
   - Never store secrets in container images
   - Rotate secrets regularly
   - Implement proper RBAC for secret access
   - Consider using external secret management solutions

### Networking
1. Service Configuration
   - Use appropriate service types based on access requirements
   - Implement proper network policies
   - Configure correct ports and protocols
   - Use meaningful service names
   - Document service dependencies

2. Access Management
   - Use Minikube tunnel for LoadBalancer services in development
   - Configure port forwarding only when needed
   - Implement proper ingress configurations
   - Use internal service communication when possible
   - Document external access requirements

3. Network Security
   - Implement network policies to restrict pod communication
   - Use TLS for service-to-service communication
   - Configure proper CORS policies
   - Monitor network traffic
   - Implement proper firewall rules

### Development Workflow
1. Local Development
   - Use consistent development environment across team
   - Maintain parity between development and production
   - Implement proper debugging configurations
   - Use development-specific configurations
   - Document local setup procedures

2. Configuration Management
   - Use ConfigMaps for application configuration
   - Implement proper environment variable management
   - Use proper configuration inheritance
   - Document configuration options
   - Version control all configurations

3. Testing and Validation
   - Implement health checks for all services
   - Use readiness and liveness probes
   - Test service dependencies
   - Validate resource configurations
   - Implement proper logging and monitoring

### Resource Management
1. Storage
   - Use appropriate storage classes
   - Implement proper backup strategies
   - Configure volume permissions correctly
   - Monitor storage usage
   - Plan for storage scaling

2. Performance
   - Optimize container resource usage
   - Implement proper caching strategies
   - Monitor application performance
   - Configure appropriate QoS classes
   - Use horizontal scaling when possible

3. High Availability
   - Configure proper replica counts
   - Implement pod disruption budgets
   - Use anti-affinity rules when needed
   - Configure proper update strategies
   - Plan for node failures

### Monitoring and Logging
1. Application Monitoring
   - Implement proper metrics collection
   - Use appropriate monitoring tools
   - Configure alerting thresholds
   - Monitor application health
   - Track resource usage trends

2. Logging Strategy
   - Implement centralized logging
   - Use appropriate log levels
   - Configure log rotation
   - Implement proper log retention
   - Monitor log storage usage

3. Debugging
   - Maintain proper debug configurations
   - Implement proper error handling
   - Configure appropriate verbosity levels
   - Document debugging procedures
   - Maintain troubleshooting guides

### Maintenance
1. Updates and Upgrades
   - Plan regular maintenance windows
   - Document update procedures
   - Test updates in staging
   - Maintain rollback procedures
   - Monitor post-update behavior

2. Backup and Recovery
   - Implement regular backup procedures
   - Test recovery procedures
   - Document disaster recovery plans
   - Maintain backup retention policies
   - Monitor backup success/failure

3. Documentation
   - Maintain up-to-date documentation
   - Document all configuration changes
   - Keep troubleshooting guides current
   - Document incident responses
   - Maintain runbooks for common tasks

## Troubleshooting Guide

### Common Issues
1. Service Access Issues
   - Verify Minikube tunnel status
   - Check service configuration
   - Verify port mappings

2. Resource Issues
   - Check resource limits
   - Monitor resource usage
   - Verify pod scheduling

### Quick Fixes
1. Service Access
   - Restart Minikube tunnel
   - Verify service configuration
   - Check pod readiness

2. Resource Management
   - Adjust resource limits
   - Monitor resource usage
   - Check node capacity

## Future Improvements
1. Implement auto-scaling
2. Enhanced monitoring
3. Resource optimization
4. Security hardening

## Quick Reference
```bash
# Cluster Management
minikube start --driver=docker
minikube status
minikube tunnel

# Resource Management
kubectl get all -n my-app
kubectl describe pod -n my-app <pod-name>
kubectl logs -n my-app <pod-name>

# Service Access
kubectl port-forward -n my-app service/frontend 8080:80
``` 