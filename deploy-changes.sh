#!/bin/bash

set -e

# Ensure we are using Minikube's Docker daemon
if ! docker info 2>&1 | grep -q 'minikube'; then
  echo "Switching to Minikube's Docker daemon..."
  eval $(minikube docker-env)
fi

# Components and their Dockerfiles
declare -A COMPONENTS
COMPONENTS=(
  [frontend]="frontend/Dockerfile"
  [backend]="backend/Dockerfile"
  [mysql-local]="kubernetes/mysql/Dockerfile"
  [loki]=""
  [promtail]=""
  [grafana]=""
  [prometheus]=""
)

# Namespaces for each component
declare -A NAMESPACES
NAMESPACES=(
  [frontend]="my-app"
  [backend]="my-app"
  [mysql-local]="my-app"
  [loki]="monitoring"
  [promtail]="monitoring"
  [grafana]="monitoring"
  [prometheus]="monitoring"
)

# Labels for each component
declare -A LABELS
LABELS=(
  [frontend]="frontend"
  [backend]="backend"
  [mysql-local]="mysql"
  [loki]="loki"
  [promtail]="promtail"
  [grafana]="grafana"
  [prometheus]="prometheus"
)

# Manifests for each component
declare -A MANIFESTS
MANIFESTS=(
  [frontend]="kubernetes/frontend-local.yaml"
  [backend]="kubernetes/backend-local.yaml"
  [mysql-local]="kubernetes/mysql-deployment.yaml"
  [loki]="kubernetes/monitoring/loki.yaml"
  [promtail]="kubernetes/monitoring/loki.yaml"
  [grafana]="kubernetes/monitoring/grafana.yaml"
  [prometheus]="kubernetes/monitoring/prometheus.yaml"
)

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
      components+=("mysql-local")
      shift
      ;;
    --loki)
      components+=("loki")
      shift
      ;;
    --promtail)
      components+=("promtail")
      shift
      ;;
    --grafana)
      components+=("grafana")
      shift
      ;;
    --prometheus)
      components+=("prometheus")
      shift
      ;;
    --all)
      components=("frontend" "backend" "mysql-local" "loki" "promtail" "grafana" "prometheus")
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--frontend] [--backend] [--mysql] [--loki] [--promtail] [--grafana] [--prometheus] [--all]"
      exit 1
      ;;
  esac
done

if [ ${#components[@]} -eq 0 ]; then
  echo "Usage: $0 [--frontend] [--backend] [--mysql] [--loki] [--promtail] [--grafana] [--prometheus] [--all]"
  exit 1
fi

for component in "${components[@]}"; do
  dockerfile="${COMPONENTS[$component]}"
  namespace="${NAMESPACES[$component]}"
  label="${LABELS[$component]}"
  manifest="${MANIFESTS[$component]}"

  echo "\n--- Deploying $component ---"

  # Build image only for app components
  if [[ -n "$dockerfile" ]]; then
    echo "Building $component image..."
    if [[ "$component" == "frontend" ]]; then
      if ! docker build -t $component:local -f $dockerfile frontend; then
        echo "⚠️  Failed to build $component image"
        exit 1
      fi
    elif [[ "$component" == "backend" ]]; then
      if ! docker build -t $component:local -f $dockerfile backend; then
        echo "⚠️  Failed to build $component image"
        exit 1
      fi
    elif [[ "$component" == "mysql-local" ]]; then
      if ! docker build -t $component:local -f $dockerfile kubernetes/mysql; then
        echo "⚠️  Failed to build $component image"
        exit 1
      fi
    else
      if ! docker build -t $component:local -f $dockerfile .; then
        echo "⚠️  Failed to build $component image"
        exit 1
      fi
    fi
  else
    echo "(Skipping build for $component, using manifest image)"
  fi

  # Apply manifest (create/update resource)
  echo "Applying manifest for $component..."
  kubectl apply -f $manifest

  # Delete old pod/daemonset if exists
  if [[ "$component" == "promtail" ]]; then
    echo "Restarting promtail daemonset..."
    kubectl rollout restart daemonset/promtail -n $namespace || true
  else
    echo "Deleting old $component pod(s)..."
    kubectl delete pod -n $namespace -l app=$label --ignore-not-found --wait=false
  fi

done

# Wait for all pods to be ready
for component in "${components[@]}"; do
  namespace="${NAMESPACES[$component]}"
  label="${LABELS[$component]}"
  if [[ "$component" == "promtail" ]]; then
    echo "Waiting for promtail pods to be ready..."
    kubectl rollout status daemonset/promtail -n $namespace --timeout=180s || true
  else
    echo "Waiting for $component pod(s) to be ready..."
    kubectl wait --for=condition=ready pod -l app=$label -n $namespace --timeout=180s || true
  fi
done

echo "\n✅ Deployment complete!"

# Verify the health of the application
if [ -f ./verify-stack.sh ]; then
  echo -e "\nVerifying application health..."
  ./verify-stack.sh
fi 