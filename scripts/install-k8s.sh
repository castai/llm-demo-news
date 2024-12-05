#!/bin/bash

set -e

REPO_URL="https://raw.githubusercontent.com/castai/llm-demo-news/LLM-249_simplify_app_k8s_setup"

echo "Applying the Kubernetes deployment..."
curl -sSL "$REPO_URL/k8s/deploy.yaml" | kubectl apply -f -

echo "Waiting for the deployment to be ready..."
kubectl rollout status deployment llm-demo-news

echo "Setting up port-forwarding..."
kubectl port-forward svc/llm-demo-news 8000:80 &
PORT_FORWARD_PID=$!

# Wait a moment to ensure port-forwarding is ready
sleep 3

echo "Port-forwarding active. Open your browser and visit: http://localhost:8000"

# Trap to clean up port-forwarding on script exit
trap "kill $PORT_FORWARD_PID" EXIT

# Keep the script running while port-forwarding
wait $PORT_FORWARD_PID