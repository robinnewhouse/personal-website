#!/bin/bash

# Deploy personal website to S3
echo "Deploying website to S3..."

aws s3 sync . s3://robinnewhouse-com \
  --exclude ".git/*" \
  --exclude "node_modules/*" \
  --exclude ".DS_Store"

echo "Website deployed successfully!"
