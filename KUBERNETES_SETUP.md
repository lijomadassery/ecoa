# ECOA Kubernetes Setup Guide

This guide provides step-by-step instructions for setting up and running the ECOA application in Kubernetes using Minikube.

## Prerequisites

- Docker installed and running
- Minikube installed
- kubectl installed
- WSL2 (if running on Windows)

## Initial Setup

1. Start Minikube:
```bash
minikube start --driver=docker
```

2. Create the namespace:
```bash
kubectl apply -f kubernetes/namespace.yaml
```

## Building and Loading Images

Since we're using Minikube with the Docker driver, we need to build and load our images into Minikube's Docker daemon:

1. Build MySQL image:
```bash
docker build -t mysql-local:latest -f Dockerfile.mysql .
```

2. Build Backend image:
```bash
docker build -t backend:local -f Dockerfile.backend .
```

3. Build Frontend image:
```bash
docker build -t frontend:local -f Dockerfile.frontend .
```

## Deploying Services

Deploy the services in the following order:

1. Deploy MySQL first (it's required by the backend):
```bash
kubectl apply -f kubernetes/mysql-deployment.yaml
```

2. Wait for MySQL to be ready:
```bash
kubectl get pods -n my-app -w
# Wait until mysql pod shows 1/1 READY
```

3. Deploy the backend service:
```bash
kubectl apply -f kubernetes/backend-local.yaml
```

4. Deploy the frontend service:
```bash
kubectl apply -f kubernetes/frontend-local.yaml
```

5. Verify all pods are running:
```bash
kubectl get pods -n my-app
```

Expected output should show all pods in Running state:
```
NAME                       READY   STATUS    RESTARTS   AGE
backend-xxxxxx-xxxx        1/1     Running   0          xxm
frontend-xxxxx-xxxx        1/1     Running   0          xxm
mysql-xxxxx-xxxx           1/1     Running   0          xxm
```

## Accessing the Application

### Method 1: Port Forwarding (Recommended for Development)

1. Set up port forwarding for the frontend service:
```bash
kubectl port-forward -n my-app service/frontend 8080:80 --address 0.0.0.0
```

2. Access the application:
- Frontend UI: http://localhost:8080
- API Health Check: http://localhost:8080/api/health

### Method 2: Using Minikube Tunnel (Alternative)

1. In a separate terminal, run:
```bash
minikube tunnel
```

2. Access the application:
- Frontend UI: http://localhost:30000
- API Health Check: http://localhost:30000/api/health

## Troubleshooting

### 1. Pod Status Check
```bash
kubectl describe pod <pod-name> -n my-app
kubectl logs <pod-name> -n my-app
```

### 2. Service Connectivity
Test backend connectivity from frontend pod:
```bash
kubectl exec -n my-app -it deployment/frontend -- curl -v http://backend:4001/api/health
```

### 3. Common Issues

1. **Connection Refused**: 
   - Verify all pods are running
   - Check service endpoints
   - Ensure port-forward is running

2. **Pod Startup Issues**:
   - Check pod logs
   - Verify image names and tags
   - Check resource limits

3. **Network Issues**:
   - Verify Minikube status
   - Check network policies
   - Ensure correct service types

## Cleanup

1. Stop port-forwarding:
```bash
pkill -f "port-forward"
```

2. Delete all resources:
```bash
kubectl delete -f kubernetes/frontend-local.yaml
kubectl delete -f kubernetes/backend-local.yaml
kubectl delete -f kubernetes/mysql-deployment.yaml
kubectl delete -f kubernetes/namespace.yaml
```

3. Stop Minikube (if needed):
```bash
minikube stop
```

## Configuration Files

### Key Configuration Files
- `kubernetes/namespace.yaml`: Namespace definition
- `kubernetes/mysql-deployment.yaml`: MySQL deployment and service
- `kubernetes/backend-local.yaml`: Backend deployment and service
- `kubernetes/frontend-local.yaml`: Frontend deployment, service, and nginx configuration

### Important Ports
- Frontend Service: 80 (container), 30000 (NodePort)
- Backend Service: 4001
- MySQL Service: 3306

## Notes

1. The frontend nginx configuration includes:
   - SPA routing support
   - API proxying to backend
   - CORS and security headers

2. The backend service is configured with:
   - Database connection settings
   - API endpoints
   - Health check endpoint

3. MySQL is configured with:
   - Persistent volume
   - Initial database setup
   - User credentials

Remember to keep the terminal open when using port-forward or minikube tunnel.

## System Restart Procedure

When your system (WSL or Windows host) restarts, follow these steps in order:

### 1. Verify Docker
```bash
# Check if Docker is running
docker ps
# If not running, start Docker Desktop on Windows
```

### 2. Start Minikube
```bash
# Check Minikube status
minikube status

# If not running, start it
minikube start --driver=docker

# Wait for it to be ready
minikube status
```

### 3. Verify Kubernetes Resources
```bash
# Check if pods are running
kubectl get pods -n my-app

# If pods are not found or namespace doesn't exist, reapply configurations:
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/mysql-deployment.yaml
kubectl apply -f kubernetes/backend-local.yaml
kubectl apply -f kubernetes/frontend-local.yaml
```

### 4. Verify Services
```bash
# Check all services
kubectl get all -n my-app

# Expected state:
# - All pods should show 1/1 READY
# - All services (mysql, backend, frontend) should have CLUSTER-IPs
# - All deployments should show 1/1 READY
```

### 5. Setup Access
Choose one of these methods:

#### Method A: Port Forward (Recommended)
```bash
# Setup port forwarding (run in background)
kubectl port-forward -n my-app service/frontend 8080:80 --address 0.0.0.0 &

# Verify access
curl http://localhost:8080/api/health
```

#### Method B: Minikube Tunnel
```bash
# Start tunnel in a separate terminal
minikube tunnel

# Verify access
curl http://localhost:30000/api/health
```

### 6. Verify Complete Stack
```bash
# Check backend health
kubectl exec -n my-app -it deployment/frontend -- curl http://backend:4001/api/health

# Check frontend access
curl http://localhost:8080/api/health  # if using port-forward
# or
curl http://localhost:30000/api/health # if using minikube tunnel
```

### Quick Verification Script
Create a file named `verify-stack.sh`:
```bash
#!/bin/bash

echo "1. Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "⚠️  Docker is not running"
    exit 1
fi
echo "✅ Docker is running"

echo -e "\n2. Checking Minikube..."
if ! minikube status | grep -q "host: Running"; then
    echo "⚠️  Minikube is not running"
    echo "Starting Minikube..."
    minikube start --driver=docker
fi
echo "✅ Minikube is running"

echo -e "\n3. Checking Kubernetes resources..."
if ! kubectl get namespace my-app > /dev/null 2>&1; then
    echo "⚠️  Namespace not found, creating resources..."
    kubectl apply -f kubernetes/namespace.yaml
    kubectl apply -f kubernetes/mysql-deployment.yaml
    kubectl apply -f kubernetes/backend-local.yaml
    kubectl apply -f kubernetes/frontend-local.yaml
fi
echo "✅ Resources exist"

echo -e "\n4. Checking pod status..."
kubectl get pods -n my-app

echo -e "\n5. Setting up port forward..."
if ! pgrep -f "port-forward.*frontend.*8080:80" > /dev/null; then
    echo "Starting port forward..."
    kubectl port-forward -n my-app service/frontend 8080:80 --address 0.0.0.0 &
fi
echo "✅ Port forward running"

echo -e "\n6. Waiting for services to be ready..."
sleep 5

echo -e "\n7. Testing API health..."
curl -s http://localhost:8080/api/health
echo -e "\n✅ Setup complete!"
```

Make the script executable:
```bash
chmod +x verify-stack.sh
```

Run it after system restarts:
```bash
./verify-stack.sh
```

## Code Deployment Procedure

When you make changes to the code, follow these steps to deploy the updates:

### 1. Frontend Changes

```bash
# Build new frontend image
docker build -t frontend:local -f Dockerfile.frontend .

# Delete the old pod to force a new deployment
kubectl delete pod -n my-app -l app=frontend

# Wait for the new pod to be ready
kubectl get pods -n my-app -w
```

### 2. Backend Changes

```bash
# Build new backend image
docker build -t backend:local -f Dockerfile.backend .

# Delete the old pod to force a new deployment
kubectl delete pod -n my-app -l app=backend

# Wait for the new pod to be ready
kubectl get pods -n my-app -w
```

### 3. Database Changes

```bash
# Build new MySQL image
docker build -t mysql-local:latest -f Dockerfile.mysql .

# Delete the old pod to force a new deployment
kubectl delete pod -n my-app -l app=mysql

# Wait for the new pod to be ready
kubectl get pods -n my-app -w
```

### Quick Deployment Script
Create a file named `deploy-changes.sh`:
```bash
#!/bin/bash

# Function to rebuild and redeploy a component
deploy_component() {
    local component=$1
    local dockerfile=$2
    local label=$3

    echo "Deploying $component changes..."
    
    # Build new image
    echo "Building new $component image..."
    if ! docker build -t $component:local -f $dockerfile .; then
        echo "⚠️  Failed to build $component image"
        return 1
    fi
    
    # Delete old pod
    echo "Removing old $component pod..."
    kubectl delete pod -n my-app -l app=$label --wait=false
    
    # Wait for new pod
    echo "Waiting for new $component pod..."
    kubectl wait --for=condition=ready pod -l app=$label -n my-app --timeout=120s
}

# Parse command line arguments
components=()
while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend)
            components+=("frontend")
            shift
            ;;
        --backend)
            components+=("backend")
            shift
            ;;
        --mysql)
            components+=("mysql")
            shift
            ;;
        --all)
            components=("frontend" "backend" "mysql")
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--frontend] [--backend] [--mysql] [--all]"
            exit 1
            ;;
    esac
done

# If no components specified, show usage
if [ ${#components[@]} -eq 0 ]; then
    echo "Usage: $0 [--frontend] [--backend] [--mysql] [--all]"
    exit 1
fi

# Deploy specified components
for component in "${components[@]}"; do
    case $component in
        "frontend")
            deploy_component "frontend" "Dockerfile.frontend" "frontend"
            ;;
        "backend")
            deploy_component "backend" "Dockerfile.backend" "backend"
            ;;
        "mysql")
            deploy_component "mysql-local" "Dockerfile.mysql" "mysql"
            ;;
    esac
done

echo "✅ Deployment complete!"

# Verify the health of the application
echo -e "\nVerifying application health..."
./verify-stack.sh
```

Make the script executable:
```bash
chmod +x deploy-changes.sh
```

### Usage Examples

1. Deploy frontend changes only:
```bash
./deploy-changes.sh --frontend
```

2. Deploy backend and frontend changes:
```bash
./deploy-changes.sh --backend --frontend
```

3. Deploy all components:
```bash
./deploy-changes.sh --all
```

The script will:
- Build new Docker images for the specified components
- Deploy the changes to Kubernetes
- Wait for the new pods to be ready
- Verify the application health

Note: When using FluxCD in the future, this manual deployment process will be replaced by automated GitOps workflows. 