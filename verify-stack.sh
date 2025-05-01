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