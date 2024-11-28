#!/bin/bash

# Define the file where the version is stored
VERSION_FILE="version.txt"

# Check if the version file exists; if not, initialize it with version 0
if [[ ! -f "$VERSION_FILE" ]]; then
  echo "0" > "$VERSION_FILE"
fi

# Read the current version from the file
TAG_VERSION=$(cat "$VERSION_FILE")

# Increment the version by 1
TAG_VERSION=$((TAG_VERSION + 1))

# Write the updated version back to the file
echo "$TAG_VERSION" > "$VERSION_FILE"

# Build the multi-architecture image and push to Docker Hub
docker buildx create --name mybuilder --use
docker buildx inspect --bootstrap
docker buildx build --platform linux/amd64,linux/arm64 -t kirilomancastai/demo:$TAG_VERSION --push .

# Output the latest version
echo "The latest version is: $TAG_VERSION"