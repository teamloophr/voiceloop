#!/bin/bash

# Teamloop + VoiceLoop S3 Deployment Script
# This script builds and deploys the application to AWS S3

set -e

# Configuration
BUCKET_NAME="teamloop-voiceloop"
REGION="us-east-1"
PROFILE="default"  # Change this to your AWS profile if needed

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Teamloop + VoiceLoop S3 Deployment${NC}"
echo "=================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity --profile $PROFILE &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured successfully${NC}"

# Step 1: Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Step 2: Build the application
echo -e "\n${YELLOW}🔨 Building application for production...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed. 'dist' directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 3: Check if S3 bucket exists, create if it doesn't
echo -e "\n${YELLOW}🪣 Checking S3 bucket...${NC}"
if aws s3 ls "s3://$BUCKET_NAME" --profile $PROFILE 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}📝 Creating S3 bucket: $BUCKET_NAME${NC}"
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION --profile $PROFILE
    
    # Configure bucket for static website hosting
    echo -e "${YELLOW}🌐 Configuring static website hosting...${NC}"
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html \
        --profile $PROFILE
    
    # Set bucket policy for public read access
    echo -e "${YELLOW}🔓 Setting bucket policy for public access...${NC}"
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket "$BUCKET_NAME" \
        --policy file://bucket-policy.json \
        --profile $PROFILE
    
    # Set CORS configuration
    echo -e "${YELLOW}🌍 Setting CORS configuration...${NC}"
    cat > cors-config.json << EOF
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
EOF
    
    aws s3api put-bucket-cors \
        --bucket "$BUCKET_NAME" \
        --cors-configuration file://cors-config.json \
        --profile $PROFILE
    
    # Clean up temporary files
    rm bucket-policy.json cors-config.json
    
    echo -e "${GREEN}✅ S3 bucket created and configured successfully${NC}"
else
    echo -e "${GREEN}✅ S3 bucket already exists${NC}"
fi

# Step 4: Deploy to S3
echo -e "\n${YELLOW}📤 Deploying to S3...${NC}"
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete --profile $PROFILE

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Step 5: Get website URL
echo -e "\n${YELLOW}🌐 Getting website URL...${NC}"
WEBSITE_URL=$(aws s3api get-bucket-website --bucket "$BUCKET_NAME" --profile $PROFILE --query 'WebsiteEndpoint' --output text 2>/dev/null || echo "N/A")

if [ "$WEBSITE_URL" != "N/A" ]; then
    echo -e "${GREEN}🎉 Your Teamloop + VoiceLoop is now live at:${NC}"
    echo -e "${BLUE}   http://$WEBSITE_URL${NC}"
    echo -e "\n${YELLOW}📱 Test VoiceLoop by navigating to the dashboard and clicking the VoiceLoop button!${NC}"
else
    echo -e "${YELLOW}⚠️  Website URL could not be retrieved. Check your S3 bucket configuration.${NC}"
fi

# Step 6: Optional CloudFront setup
echo -e "\n${YELLOW}☁️  Optional: Set up CloudFront for HTTPS and better performance${NC}"
echo "   Run: aws cloudfront create-distribution --origin-domain-name $BUCKET_NAME.s3.amazonaws.com"

echo -e "\n${GREEN}🎯 Deployment Summary:${NC}"
echo "   • Application built successfully"
echo "   • Deployed to S3 bucket: $BUCKET_NAME"
echo "   • Region: $REGION"
echo "   • Profile: $PROFILE"

echo -e "\n${BLUE}🚀 Teamloop + VoiceLoop is ready to use!${NC}"
