#!/bin/bash

# Deploy personal website to S3
echo "Deploying website to S3..."

aws s3 sync . s3://robinnewhouse-com \
  --exclude ".git/*" \
  --exclude "node_modules/*" \
  --exclude ".DS_Store"

echo "Creating CloudFront invalidation to clear cache..."
aws cloudfront create-invalidation --distribution-id EZIGKVDLQLO2E --paths "/*" --no-cli-pager

echo "Website deployed and cache cleared!"
