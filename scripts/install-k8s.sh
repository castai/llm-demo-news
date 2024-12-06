#!/bin/bash

set -e

REPO_URL="https://raw.githubusercontent.com/castai/llm-demo-news/main"

echo "Applying the Kubernetes deployment..."
curl -sSL "$REPO_URL/k8s/deploy.yaml" | kubectl apply -f -

echo "Waiting for the deployment to be ready..."
kubectl rollout status deployment llm-demo-news

echo "Setting up port-forwarding to http://localhost:8000"
kubectl port-forward svc/llm-demo-news 8000:80 &
PORT_FORWARD_PID=$!

# Trap to clean up port-forwarding on script exit
trap "kill $PORT_FORWARD_PID" EXIT

# Keep the script running while port-forwarding
wait $PORT_FORWARD_PID