#!/bin/bash

# Script: verify-image-digests.sh
# Purpose: Compare image digests running in Minikube with local Docker images
# Usage: bash verify-image-digests.sh

NAMESPACE="my-app"
DEPLOYMENTS=(frontend backend mysql)

# Get pod names for each deployment
get_pod_name() {
  kubectl get pods -n $NAMESPACE -l app=$1 -o jsonpath='{.items[0].metadata.name}'
}

# Get imageID (digest) from running pod
get_pod_image_digest() {
  local pod_name=$(get_pod_name $1)
  kubectl get pod $pod_name -n $NAMESPACE -o jsonpath='{.status.containerStatuses[0].imageID}'
}

# Get local Docker image ID (digest)
get_local_image_digest() {
  docker inspect --format='{{.Id}}' $1:local 2>/dev/null || docker inspect --format='{{.Id}}' $1-local:latest 2>/dev/null
}

printf "\n%-10s | %-70s | %-70s | %-5s\n" "Component" "Minikube Digest" "Local Docker Digest" "Match"
printf -- "%.0s-" {1..170}; echo

for component in "${DEPLOYMENTS[@]}"; do
  pod_digest=$(get_pod_image_digest $component)
  local_digest=$(get_local_image_digest $component)
  match="NO"
  if [[ "$pod_digest" == "$local_digest" ]]; then
    match="YES"
  fi
  printf "%-10s | %-70s | %-70s | %-5s\n" "$component" "$pod_digest" "$local_digest" "$match"
done

echo -e "\nIf all 'Match' columns are YES, your Minikube cluster is running the same images as your local Docker." 