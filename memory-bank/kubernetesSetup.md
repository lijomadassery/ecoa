# Kubernetes Setup and Configuration Guide

## Overview

This document details our Kubernetes setup for the ECOA project, focusing on local development using Minikube and our specific deployment configuration.

## Prerequisites

### Required Tools
- Docker Desktop
- Minikube v1.32.0+
- kubectl v1.28.0+
- WSL2 (if on Windows)

### Environment Setup
```bash
# Start Minikube
minikube start --driver=docker

# Verify cluster access
kubectl cluster-info
```

## Local Development Environment

### 1. Image Management
We use local images to avoid registry issues:

```bash
# Build images locally
docker build -t mysql-local:latest -f Dockerfile.mysql .
docker build -t backend:local -f Dockerfile.backend .
docker build -t frontend:local -f Dockerfile.frontend .
```

### 2. Namespace Configuration
```yaml
# kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-app
```

### 3. Service Architecture
Our application consists of three main services:

1. **MySQL Database**
   - Persistent storage
   - User authentication
   - Initial schema setup
   - Port: 3306

2. **Backend Service**
   - Express.js API
   - Database connectivity
   - Health monitoring
   - Port: 4001

3. **Frontend Service**
   - Nginx-based
   - SPA routing
   - API proxying
   - Ports: 80 (container), 30000 (NodePort)

## Deployment Process

### 1. Database Deployment
```bash
# Deploy MySQL first
kubectl apply -f kubernetes/mysql-deployment.yaml

# Wait for readiness
kubectl get pods -n my-app -w
```

### 2. Backend Deployment
```bash
# Deploy backend service
kubectl apply -f kubernetes/backend-local.yaml
```

### 3. Frontend Deployment
```bash
# Deploy frontend service
kubectl apply -f kubernetes/frontend-local.yaml
```

## Access Methods

### 1. Port Forwarding (Development)
```bash
# Setup port forwarding
kubectl port-forward -n my-app service/frontend 8080:80 --address 0.0.0.0

# Access URLs
Frontend: http://localhost:8080
API: http://localhost:8080/api/health
```

### 2. Minikube Tunnel (Alternative)
```bash
# Start tunnel
minikube tunnel

# Access URLs
Frontend: http://localhost:30000
API: http://localhost:30000/api/health
```

## Configuration Details

### 1. MySQL Configuration
```yaml
spec:
  containers:
  - image: mysql-local:latest
    name: mysql
    imagePullPolicy: Never
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "root"
    - name: MYSQL_DATABASE
      value: camu_ecoa_db
    - name: MYSQL_USER
      value: Admin
    - name: MYSQL_PASSWORD
      value: "@Admin002"
```

### 2. Backend Configuration
```yaml
spec:
  containers:
  - name: backend
    image: backend:local
    imagePullPolicy: Never
    env:
    - name: DB_HOST
      value: mysql
    - name: DB_NAME
      value: camu_ecoa_db
    - name: DATABASE_URL
      value: "mysql://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):3306/$(DB_NAME)"
```

### 3. Frontend Configuration
```yaml
spec:
  containers:
  - name: frontend
    image: frontend:local
    imagePullPolicy: Never
    volumeMounts:
    - name: nginx-config
      mountPath: /etc/nginx/conf.d/default.conf
      subPath: default.conf
```

## System Maintenance

### 1. System Restart Procedure
1. Verify Docker status
2. Start Minikube if needed
3. Verify/recreate namespace
4. Redeploy services
5. Setup access method

### 2. Health Monitoring
```bash
# Check pod status
kubectl get pods -n my-app

# Check service status
kubectl get services -n my-app

# View logs
kubectl logs -n my-app <pod-name>
```

### 3. Resource Cleanup
```bash
# Stop port forwarding
pkill -f "port-forward"

# Delete resources
kubectl delete -f kubernetes/frontend-local.yaml
kubectl delete -f kubernetes/backend-local.yaml
kubectl delete -f kubernetes/mysql-deployment.yaml
kubectl delete -f kubernetes/namespace.yaml

# Stop Minikube
minikube stop
```

## Troubleshooting Guide

### 1. Pod Issues
- Check pod status: `kubectl describe pod <pod-name> -n my-app`
- View logs: `kubectl logs <pod-name> -n my-app`
- Verify image availability
- Check resource limits

### 2. Service Issues
- Verify service endpoints
- Test inter-service connectivity
- Check port configurations
- Verify network policies

### 3. Access Issues
- Confirm port forwarding status
- Check Minikube tunnel
- Verify service types
- Test endpoint accessibility

## Best Practices

### 1. Development Workflow
- Use local images with `imagePullPolicy: Never`
- Maintain consistent image versions
- Follow service deployment order
- Regular health checks

### 2. Resource Management
- Set appropriate resource limits
- Use persistent storage for data
- Monitor resource usage
- Regular cleanup

### 3. Security
- Secure database credentials
- Configure CORS properly
- Use appropriate service types
- Monitor access logs

## Verification Scripts

### 1. Stack Verification
We use `verify-stack.sh` to check the entire stack:
- Docker status
- Minikube status
- Kubernetes resources
- Service accessibility
- API health

### 2. Deployment Script
`deploy-changes.sh` handles:
- Selective component deployment
- Image building
- Pod replacement
- Health verification

## Future Improvements

### 1. Planned Enhancements
- Automated health checks
- Enhanced monitoring
- Resource optimization
- Backup procedures

### 2. Security Hardening
- Secret management
- Network policies
- Access controls
- Audit logging 