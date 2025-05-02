# FluxCD Setup and Configuration Guide

## Overview

This document details our FluxCD setup process for the ECOA project, including configuration, troubleshooting steps, and lessons learned during the implementation.

## Prerequisites

### Required Tools
- Kubernetes cluster (Minikube v1.32.0+)
- kubectl v1.28.0+
- Flux CLI v2.2.0+
- Git
- Docker

### Environment Setup
```bash
# Start Minikube
minikube start --driver=docker

# Verify cluster access
kubectl cluster-info
```

## Initial FluxCD Installation

### 1. Bootstrap Process
```bash
# Check prerequisites
flux check --pre

# Bootstrap with GitHub using token authentication
flux bootstrap github \
  --owner=lijomadassery \
  --repository=ecoa-gitops \
  --branch=main \
  --path=clusters/minikube \
  --personal \
  --token-auth
```

### 2. Repository Structure
```
ecoa-gitops/
├── clusters/
│   └── minikube/
│       ├── flux-system/
│       │   ├── gotk-components.yaml
│       │   ├── gotk-sync.yaml
│       │   └── kustomization.yaml
│       └── apps/
└── custom-values.yaml
```

## Image Configuration

### 1. Local Image Setup
We use local images to avoid SSL certificate issues with remote registries. The following images are configured:

```yaml
# custom-values.yaml
registry: docker.io
image:
  repository: fluxcd
defaults:
  images:
    source-controller: docker.io/fluxcd/source-controller:v1.5.0
    kustomize-controller: docker.io/fluxcd/kustomize-controller:v1.2.0
    helm-controller: docker.io/fluxcd/helm-controller:v0.37.0
    notification-controller: docker.io/fluxcd/notification-controller:v1.2.0
```

### 2. Image Pull Policy
For local development, we set `imagePullPolicy: Never` for all deployments to use local images:

```yaml
spec:
  template:
    spec:
      containers:
      - name: container-name
        imagePullPolicy: Never
```

## SSL Certificate Configuration

### 1. Certificate Issues Encountered
- SSL verification failures when pulling images
- Certificate verification issues with GitHub API
- TLS verification problems in pods

### 2. Solutions Implemented
1. Using Local Images:
   - Pull images locally
   - Load into Minikube
   - Use `imagePullPolicy: Never`

2. GitHub Access Testing:
   ```yaml
   # test-github-pod.yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: github-test
     namespace: flux-system
   spec:
     securityContext:
       runAsUser: 0  # Run as root
     containers:
     - name: alpine
       image: alpine:3.18
       imagePullPolicy: Never
       command: ["sleep", "3600"]
       securityContext:
         allowPrivilegeEscalation: true
   ```

### 3. Certificate Testing Steps
```bash
# Test GitHub API access without certificate verification
kubectl exec -it github-test -n flux-system -- wget --no-check-certificate -qO- https://api.github.com/zen

# Install certificates in pod (requires root)
kubectl exec -it github-test -n flux-system -- apk add --no-cache ca-certificates
```

## Troubleshooting Guide

### 1. Image Pull Issues
- Symptom: ImagePullBackOff status
- Solution: Use local images with `imagePullPolicy: Never`
- Verification: Check pod status with `kubectl get pods -n flux-system`

### 2. SSL Certificate Issues
- Symptom: Certificate verification failed
- Solution: Use token authentication for GitHub and local images
- Verification: Test GitHub API access

### 3. Permission Issues
- Symptom: Permission denied errors
- Solution: Configure appropriate security contexts
- Verification: Check pod logs and events

## Best Practices

### 1. Security
- Use token authentication for GitHub access
- Properly manage sensitive information
- Use appropriate security contexts

### 2. Image Management
- Use local images for development
- Maintain consistent image versions
- Document image build processes

### 3. Testing
- Use test pods for connectivity verification
- Implement health checks
- Monitor pod status and logs

## Monitoring and Maintenance

### 1. Health Checks
```bash
# Check Flux system status
flux get all

# Verify pod status
kubectl get pods -n flux-system

# Check logs
kubectl logs -n flux-system deployment/source-controller
```

### 2. Common Operations
```bash
# Reconcile sources
flux reconcile source git flux-system

# Suspend/Resume automation
flux suspend kustomization flux-system
flux resume kustomization flux-system
```

## Future Improvements

### 1. Planned Enhancements
- Automated certificate management
- Enhanced security contexts
- Improved monitoring and alerting
- Automated health checks

### 2. Security Hardening
- Implement least privilege access
- Enhance certificate management
- Improve secret handling
- Add security scanning

## Appendix

### Useful Commands
```bash
# Get Flux system status
flux get all

# Check pod logs
kubectl logs -n flux-system <pod-name>

# Verify GitHub access
kubectl exec -it github-test -n flux-system -- wget --no-check-certificate -qO- https://api.github.com/zen

# Install certificates
kubectl exec -it github-test -n flux-system -- apk add --no-cache ca-certificates
```

### Reference Documentation
- [FluxCD Official Documentation](https://fluxcd.io/docs/)
- [Kubernetes Security Contexts](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/)
- [SSL Certificate Management](https://kubernetes.io/docs/tasks/tls/managing-tls-in-a-cluster/) 