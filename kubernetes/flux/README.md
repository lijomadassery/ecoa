# FluxCD Configuration

This directory contains the FluxCD configuration for the ECOA project.

## Directory Structure

```
kubernetes/flux/
├── base/                  # Base FluxCD configuration
│   ├── custom-values.yaml # Custom values for FluxCD
│   ├── kustomization.yaml # Base kustomization
│   └── namespace.yaml     # Flux system namespace
├── clusters/              # Cluster-specific configurations
│   └── minikube/         # Minikube cluster configuration
│       └── kustomization.yaml
└── crds/                 # Custom Resource Definitions
```

## Usage

The configuration is organized using Kustomize to support multiple environments:

1. `base/` contains the common configuration shared across all clusters
2. `clusters/` contains cluster-specific overrides and configurations
3. `crds/` contains the Custom Resource Definitions required by FluxCD

### Minikube Setup

For local development with Minikube:

1. Apply the CRDs:
   ```bash
   kubectl apply -k kubernetes/flux/crds
   ```

2. Apply the Minikube configuration:
   ```bash
   kubectl apply -k kubernetes/flux/clusters/minikube
   ```

## Configuration Details

### Image Registry

We use Docker Hub instead of GHCR.io due to network restrictions. The image configurations are defined in:
- `base/custom-values.yaml`
- `clusters/minikube/kustomization.yaml`

### Components

The following FluxCD components are configured:
- Source Controller
- Kustomize Controller
- Helm Controller
- Notification Controller

## Maintenance

When updating FluxCD:

1. Update image versions in:
   - `base/custom-values.yaml`
   - `clusters/minikube/kustomization.yaml`

2. Apply the changes:
   ```bash
   kubectl apply -k kubernetes/flux/clusters/minikube
   ``` 