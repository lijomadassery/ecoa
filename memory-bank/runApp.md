## Commands

cdcr@PVDTS:~/code/ecoa$ minikube tunnel
cdcr@PVDTS:~/code/ecoa$ kubectl port-forward svc/backend 4001:4001 -n my-app
ecoa app - http://localhost:8080/dashboard

Start Monitoring
minikube service grafana -n monitoring
grafana dashboard - http://127.0.0.1:42933/dashboards


# Kubernetes and Minikube Command Reference Guide

This comprehensive guide covers the key commands used in our cluster management operations, organized by function with explanations.

## Minikube Management

```bash
# Check Minikube status
minikube status

# Stop Minikube
minikube stop

# Start Minikube
minikube start

# Delete Minikube cluster
minikube delete

# Get Minikube IP address
minikube ip

# Access Minikube dashboard
minikube dashboard

# Access a service directly
minikube service grafana -n monitoring

# Execute SSH command in Minikube VM
minikube ssh "command"

# Copy file to Minikube
minikube cp /local/path/file.txt /vm/path/file.txt

# Restart Docker in Minikube
minikube ssh "sudo systemctl restart docker"

# Pull Docker images in Minikube
minikube ssh -- docker pull grafana/grafana:10.0.0
```

## Cluster Information

```bash
# Get Kubernetes version
kubectl version

# View current context
kubectl config current-context

# List all contexts
kubectl config get-contexts

# Switch context
kubectl config use-context minikube

# View cluster information
kubectl cluster-info

# Get API resources
kubectl api-resources
```

## Namespace Operations

```bash
# List namespaces
kubectl get namespaces
kubectl get ns

# Create namespace
kubectl create namespace monitoring

# Delete namespace
kubectl delete namespace monitoring

# Set default namespace for context
kubectl config set-context --current --namespace=monitoring
```

## Pod Management

```bash
# List pods in a namespace
kubectl get pods -n monitoring

# Watch pods (real-time updates)
kubectl get pods -n monitoring -w

# Get detailed pod information
kubectl describe pod grafana-7dd77ff988-gqzhm -n monitoring

# Get pod logs
kubectl logs loki-7488d88bb4-2vv82 -n monitoring

# Get logs from a specific container in a pod
kubectl logs pod-name -c container-name -n namespace

# Delete pod
kubectl delete pod loki-7488d88bb4-2vv82 -n monitoring

# Execute command in pod
kubectl exec -it grafana-7dd77ff988-gqzhm -n monitoring -- bash

# Get pod YAML
kubectl get pod loki-7488d88bb4-2vv82 -n monitoring -o yaml

# Wait for pod ready condition
kubectl wait --for=condition=ready pod -l app=source-controller -n flux-system --timeout=60s
```

## Deployment Management

```bash
# List deployments
kubectl get deployments -n monitoring

# Get deployment details
kubectl describe deployment grafana -n monitoring

# Get deployment configuration
kubectl get deployment grafana -n monitoring -o yaml

# Scale deployment
kubectl scale deployment grafana --replicas=2 -n monitoring

# Create/update deployment from file
kubectl apply -f loki-deployment-updated.yaml

# Delete deployment
kubectl delete deployment loki -n monitoring

# Restart deployment
kubectl rollout restart deployment source-controller -n flux-system

# Get deployment rollout status
kubectl rollout status deployment source-controller -n flux-system

# Patch a deployment
kubectl patch deployment source-controller -n flux-system --patch-file source-controller-patch.yaml
```

## Service Management

```bash
# List services
kubectl get services -n monitoring
kubectl get svc -n monitoring

# Get service details
kubectl describe service grafana -n monitoring

# Create service from a deployment
kubectl expose deployment grafana --type=NodePort --port=3000 -n monitoring

# Delete service
kubectl delete service grafana -n monitoring

# Get service ports
kubectl get svc grafana -n monitoring -o jsonpath='{.spec.ports[0].nodePort}'

# Port forward to service
kubectl port-forward svc/grafana 3000:3000 -n monitoring
```

## ConfigMap & Secret Management

```bash
# List ConfigMaps
kubectl get configmaps -n monitoring
kubectl get cm -n monitoring

# Create ConfigMap from file
kubectl create configmap ca-certificates --from-file=/tmp/ca-certificates/ca-certificates.crt -n flux-system

# Get ConfigMap data
kubectl get configmap loki-config -n monitoring -o yaml

# List secrets
kubectl get secrets -n monitoring

# Create secret
kubectl create secret generic grafana-admin --from-literal=password=admin123 -n monitoring

# Get secret data (base64 encoded)
kubectl get secret -n monitoring grafana-admin -o jsonpath='{.data.password}'

# Decode secret
kubectl get secret -n monitoring grafana-admin -o jsonpath='{.data.password}' | base64 -d
```

## DaemonSet Management

```bash
# List DaemonSets
kubectl get daemonsets -n monitoring
kubectl get ds -n monitoring

# Create/update DaemonSet
kubectl apply -f promtail-daemonset-updated.yaml

# Get DaemonSet details
kubectl describe daemonset promtail -n monitoring

# Delete DaemonSet
kubectl delete daemonset promtail -n monitoring
```

## FluxCD-Specific Commands

```bash
# Check FluxCD version
flux version

# Get GitRepositories
kubectl get gitrepositories -A

# Get Kustomizations
kubectl get kustomizations -A

# Bootstrap FluxCD with GitHub
flux bootstrap github --owner=USERNAME --repository=REPO-NAME --path=clusters/my-cluster

# Create a source
flux create source git my-app --url=https://github.com/user/app --branch=main

# Create a Kustomization
flux create kustomization my-app --source=my-app --path=./kustomize
```

## Resource Management

```bash
# Create resources from YAML files
kubectl apply -f filename.yaml

# Delete resources from YAML files
kubectl delete -f filename.yaml

# Edit resources directly
kubectl edit deployment loki -n monitoring

# Get resource YAML
kubectl get deployment loki -n monitoring -o yaml > loki-deployment.yaml

# Get specific information using jsonpath
kubectl get deployment source-controller -n flux-system -o jsonpath='{.spec.template.spec.containers[0].env}'
```

## Troubleshooting Commands

```bash
# Check node status
kubectl get nodes

# Show pod resources
kubectl top pods -n monitoring

# Show node resources
kubectl top nodes

# Check events
kubectl get events -n monitoring

# Check persistent volumes
kubectl get pv,pvc -n monitoring

# Check specific events for a pod
kubectl get events -n monitoring --field-selector involvedObject.name=loki-7488d88bb4-2vv82

# Check Pod Security Policies
kubectl get psp
```

## Output Formatting

```bash
# Get output in YAML format
kubectl get deployment grafana -n monitoring -o yaml

# Get output in JSON format
kubectl get pods -n monitoring -o json

# Get specific fields using jsonpath
kubectl get pods -n monitoring -o jsonpath='{.items[*].metadata.name}'

# Get resources in custom columns
kubectl get pods -n monitoring -o=custom-columns=NAME:.metadata.name,STATUS:.status.phase

# Get resource with no headers
kubectl get pods -n monitoring --no-headers
```

## Useful Combinations

```bash
# Check all resources in a namespace
kubectl get all -n monitoring

# Delete all resources in a namespace
kubectl delete all --all -n monitoring

# Create and view a new resource
kubectl apply -f deployment.yaml && kubectl get pods -n monitoring

# Describe multiple resources
kubectl describe pods,svc -n monitoring

# Check logs and events for troubleshooting
kubectl logs pod-name -n monitoring && kubectl get events -n monitoring
```

This command reference covers most operations we performed on your Kubernetes cluster and should serve as a helpful guide for future cluster management tasks.