#!/bin/bash

# Apply the Kubernetes configuration
kubectl apply -f k8s/demo.yaml

# Initialize variables
MAX_RETRIES=12  # Maximum number of retries (12 * 5 seconds = 1 minute)
RETRY_INTERVAL=5  # Wait time between retries in seconds
EXTERNAL_IP=""

# Retry loop to get the external IP
for ((i=0; i<MAX_RETRIES; i++)); do
    EXTERNAL_IP=$(kubectl get svc demo -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [[ -n "$EXTERNAL_IP" ]]; then
        break  # Exit loop if IP is found
    fi
    
    echo "Waiting for external IP. It may take a few attempts... (attempt $((i+1)))"
    sleep $RETRY_INTERVAL
done

# Check if the external IP was found
if [[ -z "$EXTERNAL_IP" ]]; then
    echo "Failed to get the external IP after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
    exit 1
else
    echo "External IP: http://$EXTERNAL_IP"
fi