# Comprehensive Guide to Dockerizing and Deploying an Application on Kubernetes

This guide covers the complete process of containerizing an application with Docker and deploying it to Kubernetes, focusing on a Vue.js/Express/MySQL stack.

## 1. Application Architecture

Our application consists of three main components:
- **Frontend**: Vue.js application
- **Backend**: Express.js API
- **Database**: MySQL 

## 2. Dockerizing the Application

### 2.1 Frontend Dockerfile

```dockerfile
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2.2 Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### 2.3 Docker Compose for Local Development

```yaml
version: '3'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=database
      - DB_USER=Admin
      - DB_PASSWORD=@Admin002
      - DB_NAME=camu_ecoa_db
    depends_on:
      - database
  
  database:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      - MYSQL_DATABASE=camu_ecoa_db
      - MYSQL_USER=Admin
      - MYSQL_PASSWORD=@Admin002
      - MYSQL_ALLOW_EMPTY_PASSWORD=true
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

## 3. Setting Up Kubernetes

### 3.1 Installing Tools

For a local Kubernetes setup:
- Docker Desktop with Kubernetes (for Mac/Windows)
- Minikube (for all platforms)
- kubectl command-line tool

Installation commands:
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube-linux-amd64
sudo mv minikube-linux-amd64 /usr/local/bin/minikube

# Start Minikube
minikube start --driver=docker
```

## 4. Creating Kubernetes Manifests

### 4.1 Directory Structure

```
project-root/
├── frontend/
│   └── Dockerfile
├── backend/
│   └── Dockerfile
├── docker-compose.yml
└── kubernetes/
    ├── namespace.yaml
    ├── mysql-deployment.yaml
    ├── backend-deployment.yaml
    └── frontend-deployment.yaml
```

### 4.2 Kubernetes Manifest Files

**namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-app
```

**mysql-deployment.yaml**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: my-app
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
  namespace: my-app
type: Opaque
data:
  username: QWRtaW4=
  password: QEFkbWluMDAy
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: my-app
spec:
  selector:
    matchLabels:
      app: mysql
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - image: mysql:8
        name: mysql
        env:
        - name: MYSQL_DATABASE
          value: camu_ecoa_db
        - name: MYSQL_USER
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: username
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        - name: MYSQL_ALLOW_EMPTY_PASSWORD
          value: "true"
        ports:
        - containerPort: 3306
          name: mysql
        volumeMounts:
        - name: mysql-persistent-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-persistent-storage
        persistentVolumeClaim:
          claimName: mysql-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mysql
  namespace: my-app
spec:
  ports:
  - port: 3306
  selector:
    app: mysql
```

**backend-deployment.yaml**
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
        image: lijomadassery/backend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          value: mysql
        - name: DB_NAME
          value: camu_ecoa_db
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: my-app
spec:
  selector:
    app: backend
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP
```

**frontend-deployment.yaml**
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
        image: lijomadassery/frontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: my-app
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 80
  type: LoadBalancer
```

## 5. Deployment Process

### 5.1 Building and Pushing Docker Images

```bash
# Build and push frontend image
cd frontend/
docker build -t lijomadassery/frontend:latest .
docker push lijomadassery/frontend:latest

# Build and push backend image
cd ../backend/
docker build -t lijomadassery/backend:latest .
docker push lijomadassery/backend:latest
```

### 5.2 Applying Kubernetes Manifests

```bash
# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Deploy MySQL
kubectl apply -f kubernetes/mysql-deployment.yaml

# Deploy backend
kubectl apply -f kubernetes/backend-deployment.yaml

# Deploy frontend
kubectl apply -f kubernetes/frontend-deployment.yaml
```

### 5.3 Verifying Deployment

```bash
# Check all resources in the namespace
kubectl get all -n my-app

# Access the frontend application
minikube service frontend -n my-app
```

## 6. Working with Minikube

### 6.1 Minikube's Docker Environment

When working with Minikube, you can build images directly in Minikube's Docker environment:

```bash
# Configure terminal to use Minikube's Docker daemon
eval $(minikube docker-env)

# Build images (they'll be immediately available to Minikube)
docker build -t frontend:local .
```

### 6.2 Handling Certificate Issues

For environments with certificate issues, you can configure Docker to trust corporate certificates:

```bash
# Create certificate directories
sudo mkdir -p /etc/docker/certs.d/docker.io
sudo mkdir -p /etc/docker/certs.d/registry-1.docker.io

# Copy corporate certificates
sudo cp /path/to/ca-certificate.crt /etc/docker/certs.d/docker.io/ca.crt
sudo cp /path/to/ca-certificate.crt /etc/docker/certs.d/registry-1.docker.io/ca.crt

# Restart Docker
sudo systemctl restart docker
```

## 7. Setting Up Continuous Deployment with FluxCD

### 7.1 Install Flux CLI

```bash
curl -s https://fluxcd.io/install.sh | sudo bash
```

### 7.2 Bootstrap FluxCD with GitHub

```bash
# Set GitHub credentials
export GITHUB_USER=lijomadassery
export GITHUB_TOKEN=your-personal-access-token

# Bootstrap Flux
flux bootstrap github \
  --owner=$GITHUB_USER \
  --repository=ecoa-gitops \
  --branch=main \
  --path=clusters/minikube \
  --personal
```

### 7.3 Create Application Source

```yaml
# source.yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: ecoa-app
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/lijomadassery/ecoa.git
  ref:
    branch: main
```

### 7.4 Create Kustomization

```yaml
# kustomization.yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: ecoa-app
  namespace: flux-system
spec:
  interval: 5m
  path: ./kubernetes
  prune: true
  sourceRef:
    kind: GitRepository
    name: ecoa-app
  targetNamespace: my-app
```

## 8. Testing and Debugging

### 8.1 Checking Pod Status

```bash
kubectl get pods -n my-app
kubectl describe pod <pod-name> -n my-app
kubectl logs <pod-name> -n my-app
```

### 8.2 Accessing Services

```bash
# For LoadBalancer services in Minikube
minikube service frontend -n my-app

# For port forwarding
kubectl port-forward svc/frontend 8080:80 -n my-app
```

### 8.3 Debugging Image Pull Issues

For environments with certificate issues, use:

```bash
# Use local images with imagePullPolicy: Never
kubectl patch deployment frontend -n my-app -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","imagePullPolicy":"Never"}]}}}}'
```

## 9. Advanced Configuration

### 9.1 ConfigMaps for Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: my-app
data:
  environment: development
  api_url: http://backend:3000
```

### 9.2 Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
  namespace: my-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

This guide provides a comprehensive overview of the process we followed to containerize your Vue.js/Express/MySQL application and deploy it on Kubernetes with FluxCD for continuous deployment.