# FluxCD Setup and Configuration Guide

## Overview
This document details the successful FluxCD setup for the ECOA project, including configuration, troubleshooting steps, and lessons learned during implementation.

## Prerequisites
- Kubernetes cluster (Minikube v1.32.0+)
- kubectl v1.28.0+
- Flux CLI v2.2.0+
- Git repository access

## Initial Setup

### 1. Repository Structure
```
ecoa-gitops/
├── clusters/
│   └── minikube/
│       ├── git-repository.yaml
│       └── kustomization.yaml
```

### 2. Core Components
1. GitRepository Configuration:
```yaml
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
  secretRef:
    name: git-ssl-cert
```

2. Kustomization Configuration:
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: ecoa-app
  namespace: flux-system
spec:
  interval: 1m
  path: ./kubernetes
  prune: true
  sourceRef:
    kind: GitRepository
    name: ecoa-app
  targetNamespace: my-app
```

## SSL Certificate Configuration

### 1. Creating CA Certificate Secret
```bash
kubectl -n flux-system create secret generic git-ssl-cert \
  --from-file=caFile=/etc/ssl/certs/ca-certificates.crt
```

### 2. Environment Variables
The following environment variables are set in the source-controller:
- GIT_SSL_NO_VERIFY=true
- GIT_SSL_CAINFO=/etc/ssl/certs/ca-certificates.crt

## Synchronization Status

### 1. Checking Source Status
```bash
flux get sources git -A
```

### 2. Checking Kustomization Status
```bash
flux get kustomizations -A
```

## Deployment Workflow

### 1. Making Changes
1. Update Kubernetes manifests in the `kubernetes/` directory
2. Commit and push changes to the repository
3. FluxCD automatically detects and applies changes within 1 minute

### 2. Monitoring Changes
```bash
# Check GitRepository status
flux get sources git -A

# Check Kustomization status
flux get kustomizations -A

# Check specific resources
kubectl get deployment -n my-app frontend -o yaml
```

## Troubleshooting Guide

### 1. SSL Certificate Issues
- Create CA certificate secret
- Set appropriate environment variables
- Use permissive SSL verification when needed

### 2. Pod Security
- Configure appropriate security contexts
- Handle certificate mounting properly
- Manage pod privileges carefully

### 3. Common Issues and Solutions
1. SSL Verification Failures:
   - Solution: Create and use CA certificate secret
   - Verify certificate paths and permissions

2. Sync Issues:
   - Check GitRepository status
   - Verify Kustomization configuration
   - Check pod logs for detailed errors

## Best Practices

### 1. Security
- Use secrets for sensitive information
- Implement proper RBAC
- Follow pod security standards

### 2. Monitoring
- Regularly check sync status
- Monitor pod health
- Review logs for issues

### 3. Maintenance
- Keep manifests up to date
- Regular certificate rotation
- Clean up unused resources

## Future Improvements
1. Implement automated certificate management
2. Add monitoring and alerting
3. Enhance security measures
4. Implement backup strategies

## Quick Reference Commands
```bash
# Get all FluxCD resources
flux get all -A

# Check specific resource
flux get sources git -A
flux get kustomizations -A

# Check logs
kubectl logs -n flux-system deployment/source-controller

# Force reconciliation
flux reconcile source git flux-system
flux reconcile kustomization flux-system
```

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