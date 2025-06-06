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

# Create namespace if it doesn't exist
kubectl create namespace default --dry-run=client -o yaml | kubectl apply -f -

# Apply Locust deployment
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: locust-master
spec:
  replicas: 1
  selector:
    matchLabels:
      app: locust
      role: master
  template:
    metadata:
      labels:
        app: locust
        role: master
    spec:
      containers:
      - name: locust
        image: locustio/locust:2.37.5
        command: ["locust", "-f", "/mnt/locustfile.py", "--master"]
        volumeMounts:
        - name: locustfile
          mountPath: /mnt
      volumes:
      - name: locustfile
        configMap:
          name: locustfile-configmap
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: locust-worker
spec:
  replicas: 0
  selector:
    matchLabels:
      app: locust
      role: worker
  template:
    metadata:
      labels:
        app: locust
        role: worker
    spec:
      containers:
      - name: locust
        image: locustio/locust:2.37.5
        command: ["locust", "-f", "/mnt/locustfile.py", "--worker", "--master-host", "locust-master"]
        volumeMounts:
        - name: locustfile
          mountPath: /mnt
      volumes:
      - name: locustfile
        configMap:
          name: locustfile-configmap
---
apiVersion: v1
kind: Service
metadata:
  name: locust-master
spec:
  selector:
    app: locust
    role: master
  ports:
  - name: web
    port: 8089
    targetPort: 8089
  - name: master-worker
    port: 5557
    targetPort: 5557
  type: ClusterIP
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: locustfile-configmap
data:
  locustfile.py: |
    from locust import HttpUser, task
    import random
    import string

    class WebAppUser(HttpUser):
        @task
        def test_invocations_endpoint(self):
            headers = {
                "Content-Type": "application/json",
            }

            data = {
                "model": "llama3.1:8b",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "What is machine learning?"}
                ]
            }

            self.client.post(
                url="openai/v1/chat/completions",
                headers=headers,
                json=data
            )
EOF

# Apply the demo app deployment
kubectl apply -f k8s/

# Wait for deployments to be ready
kubectl wait --for=condition=available --timeout=300s deployment/demo-app -n default

# Port forward the demo app
kubectl port-forward svc/demo-app 8000:8000 -n default &