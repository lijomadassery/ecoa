# Kubernetes and FluxCD Quick Start Guide

## Prerequisites Installation

### 1. Install Required Tools
```bash
# Install Homebrew (for macOS)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install kubectl
brew install kubectl

# Install Minikube
brew install minikube

# Install FluxCD CLI
brew install fluxcd/tap/flux
```

### 2. Verify Installations
```bash
# Check versions
kubectl version --client
minikube version
flux --version
```

## Setting Up Local Kubernetes Cluster

### 1. Start Minikube
```bash
# Start with Docker driver
minikube start --driver=docker

# Verify cluster status
minikube status
kubectl cluster-info
```

### 2. Create Application Namespace
```bash
# Create namespace
kubectl create namespace my-app
```

## Setting Up FluxCD

### 1. Prerequisites Check
```bash
# Check if your cluster is ready for Flux
flux check --pre

# Create a GitHub personal access token
# Go to GitHub -> Settings -> Developer settings -> Personal access tokens
# Create a token with 'repo' permissions
```

### 2. Bootstrap FluxCD
```bash
# Bootstrap with GitHub
flux bootstrap github \
  --owner=YOUR-GITHUB-USERNAME \
  --repository=YOUR-GITOPS-REPO \
  --branch=main \
  --path=clusters/minikube \
  --personal \
  --token-auth
```

### 3. Repository Structure Setup
```bash
# Create GitOps repository structure
mkdir -p clusters/minikube
cd clusters/minikube

# Create basic configuration files
touch git-repository.yaml kustomization.yaml
```

### 4. Configure Source and Kustomization
```yaml
# git-repository.yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: your-app
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/YOUR-USERNAME/YOUR-APP-REPO.git
  ref:
    branch: main
  secretRef:
    name: git-ssl-cert

---
# kustomization.yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: your-app
  namespace: flux-system
spec:
  interval: 1m
  path: ./kubernetes
  prune: true
  sourceRef:
    kind: GitRepository
    name: your-app
  targetNamespace: my-app
```

## Application Deployment Setup

### 1. Basic Service Template
```yaml
# kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
  namespace: my-app
spec:
  selector:
    app: your-app
  ports:
    - port: 8080
      targetPort: 80
  type: LoadBalancer
```

### 2. Basic Deployment Template
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
  namespace: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: your-app
  template:
    metadata:
      labels:
        app: your-app
    spec:
      containers:
      - name: app
        image: your-app:local
        imagePullPolicy: Never
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
```

## Local Development Access

### 1. Enable LoadBalancer Access
```bash
# Start Minikube tunnel in a separate terminal
minikube tunnel

# Verify service external IP
kubectl get service -n my-app
```

### 2. Alternative Port Forwarding
```bash
# Forward specific service port
kubectl port-forward -n my-app service/app-service 8080:80
```

## Verification and Monitoring

### 1. Check FluxCD Status
```bash
# Check all resources
flux get all -A

# Check specific resources
flux get sources git -A
flux get kustomizations -A
```

### 2. Check Application Status
```bash
# Check all resources in namespace
kubectl get all -n my-app

# Check specific components
kubectl get pods -n my-app
kubectl get services -n my-app
kubectl get deployments -n my-app
```

## Common Issues and Solutions

### 1. SSL Certificate Issues
```bash
# Create CA certificate secret
kubectl -n flux-system create secret generic git-ssl-cert \
  --from-file=caFile=/etc/ssl/certs/ca-certificates.crt

# Update GitRepository to use certificate
# Add secretRef to GitRepository spec as shown above
```

### 2. Image Pull Issues
```yaml
# For local development, use:
imagePullPolicy: Never

# Build and load local images:
docker build -t your-app:local .
minikube image load your-app:local
```

### 3. Service Access Issues
```bash
# Check service status
kubectl get service -n my-app

# If LoadBalancer pending, ensure tunnel is running
minikube tunnel

# Check logs if needed
kubectl logs -n my-app deployment/your-deployment
```

## Best Practices Checklist

### 1. Repository Structure
- [ ] Separate GitOps repository
- [ ] Clear directory structure
- [ ] Proper documentation
- [ ] Version controlled configurations

### 2. Security
- [ ] Resource limits set
- [ ] Proper RBAC configuration
- [ ] Secrets management
- [ ] Network policies

### 3. Monitoring
- [ ] Health checks configured
- [ ] Resource monitoring
- [ ] Logging setup
- [ ] Alerts configured

### 4. Maintenance
- [ ] Backup procedures
- [ ] Update strategy
- [ ] Rollback procedures
- [ ] Documentation maintained

## Quick Commands Reference
```bash
# Cluster Management
minikube start --driver=docker
minikube tunnel

# FluxCD
flux get all -A
flux reconcile source git flux-system

# Kubernetes
kubectl get all -n my-app
kubectl logs -n my-app deployment/your-deployment
kubectl describe pod -n my-app pod-name
``` 