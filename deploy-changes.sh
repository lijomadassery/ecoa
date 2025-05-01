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