# Teamloop + VoiceLoop S3 Deployment Script (PowerShell)
# This script builds and deploys the application to AWS S3

param(
    [string]$BucketName = "teamloop-voiceloop",
    [string]$Region = "us-east-1",
    [string]$Profile = "default"
)

# Error handling
$ErrorActionPreference = "Stop"

Write-Host "🚀 Teamloop + VoiceLoop S3 Deployment" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

# Check if AWS CLI is installed
try {
    $null = Get-Command aws -ErrorAction Stop
    Write-Host "✅ AWS CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if AWS credentials are configured
try {
    $null = aws sts get-caller-identity --profile $Profile 2>$null
    Write-Host "✅ AWS credentials configured successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS credentials not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Build the application
Write-Host "`n🔨 Building application for production..." -ForegroundColor Yellow
npm run build

if (-not (Test-Path "dist")) {
    Write-Host "❌ Build failed. 'dist' directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Step 3: Check if S3 bucket exists, create if it doesn't
Write-Host "`n🪣 Checking S3 bucket..." -ForegroundColor Yellow
try {
    $null = aws s3 ls "s3://$BucketName" --profile $Profile 2>$null
    Write-Host "✅ S3 bucket already exists" -ForegroundColor Green
} catch {
    Write-Host "📝 Creating S3 bucket: $BucketName" -ForegroundColor Yellow
    
    # Create bucket
    aws s3 mb "s3://$BucketName" --region $Region --profile $Profile
    
    # Configure bucket for static website hosting
    Write-Host "🌐 Configuring static website hosting..." -ForegroundColor Yellow
    aws s3 website "s3://$BucketName" --index-document index.html --error-document index.html --profile $Profile
    
    # Set bucket policy for public read access
    Write-Host "🔓 Setting bucket policy for public access..." -ForegroundColor Yellow
    $bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        }
    ]
}
"@
    
    $bucketPolicy | Out-File -FilePath "bucket-policy.json" -Encoding UTF8
    aws s3api put-bucket-policy --bucket "$BucketName" --policy file://bucket-policy.json --profile $Profile
    
    # Set CORS configuration
    Write-Host "🌍 Setting CORS configuration..." -ForegroundColor Yellow
    $corsConfig = @"
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
"@
    
    $corsConfig | Out-File -FilePath "cors-config.json" -Encoding UTF8
    aws s3api put-bucket-cors --bucket "$BucketName" --cors-configuration file://cors-config.json --profile $Profile
    
    # Clean up temporary files
    Remove-Item "bucket-policy.json" -ErrorAction SilentlyContinue
    Remove-Item "cors-config.json" -ErrorAction SilentlyContinue
    
    Write-Host "✅ S3 bucket created and configured successfully" -ForegroundColor Green
}

# Step 4: Deploy to S3
Write-Host "`n📤 Deploying to S3..." -ForegroundColor Yellow
aws s3 sync dist/ "s3://$BucketName" --delete --profile $Profile

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green

# Step 5: Get website URL
Write-Host "`n🌐 Getting website URL..." -ForegroundColor Yellow
try {
    $websiteUrl = aws s3api get-bucket-website --bucket "$BucketName" --profile $Profile --query 'WebsiteEndpoint' --output text 2>$null
    if ($websiteUrl) {
        Write-Host "🎉 Your Teamloop + VoiceLoop is now live at:" -ForegroundColor Green
        Write-Host "   http://$websiteUrl" -ForegroundColor Blue
        Write-Host "`n📱 Test VoiceLoop by navigating to the dashboard and clicking the VoiceLoop button!" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Website URL could not be retrieved. Check your S3 bucket configuration." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not retrieve website URL. Check your S3 bucket configuration." -ForegroundColor Yellow
}

# Step 6: Optional CloudFront setup
Write-Host "`n☁️  Optional: Set up CloudFront for HTTPS and better performance" -ForegroundColor Yellow
Write-Host "   Run: aws cloudfront create-distribution --origin-domain-name $BucketName.s3.amazonaws.com" -ForegroundColor White

Write-Host "`n🎯 Deployment Summary:" -ForegroundColor Green
Write-Host "   • Application built successfully" -ForegroundColor White
Write-Host "   • Deployed to S3 bucket: $BucketName" -ForegroundColor White
Write-Host "   • Region: $Region" -ForegroundColor White
Write-Host "   • Profile: $Profile" -ForegroundColor White

Write-Host "`n🚀 Teamloop + VoiceLoop is ready to use!" -ForegroundColor Blue
