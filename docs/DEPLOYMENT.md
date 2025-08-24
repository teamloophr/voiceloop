# 🚀 Teamloop + VoiceLoop Deployment Guide

This guide covers deploying Teamloop + VoiceLoop to AWS S3 with optional CloudFront distribution for enhanced performance and HTTPS support.

## 📋 Prerequisites

### Required Tools
- **Node.js** 18+ and **npm** 9+
- **AWS CLI** configured with appropriate permissions
- **Git** for version control

### AWS Requirements
- **AWS Account** with appropriate permissions
- **IAM User** with S3 and CloudFront access
- **Region** preference (default: us-east-1)

## 🎯 Deployment Options

### Option 1: Quick S3 Deployment (Recommended for Testing)
- Simple S3 bucket hosting
- HTTP access
- Fastest setup

### Option 2: Production Deployment with CloudFront
- S3 + CloudFront distribution
- HTTPS support
- Global CDN
- Better performance

### Option 3: Custom Domain with SSL
- Custom domain name
- SSL certificate
- Professional appearance

## 🚀 Quick S3 Deployment

### Step 1: Prepare Your Environment

```bash
# Clone the repository
git clone https://github.com/your-username/teamloop-voiceloop.git
cd teamloop-voiceloop

# Install dependencies
npm install

# Configure AWS CLI (if not already done)
aws configure
```

### Step 2: Run the Deployment Script

#### **Linux/macOS:**
```bash
# Make script executable
chmod +x deploy-s3.sh

# Run deployment
./deploy-s3.sh
```

#### **Windows PowerShell:**
```powershell
# Run deployment
.\deploy-s3.ps1
```

#### **Manual Deployment:**
```bash
# Build the application
npm run build

# Create S3 bucket
aws s3 mb s3://teamloop-voiceloop --region us-east-1

# Configure static website hosting
aws s3 website s3://teamloop-voiceloop --index-document index.html --error-document index.html

# Deploy to S3
aws s3 sync dist/ s3://teamloop-voiceloop --delete
```

### Step 3: Access Your Application

Your application will be available at:
```
http://teamloop-voiceloop.s3-website-us-east-1.amazonaws.com
```

## ☁️ Production Deployment with CloudFront

### Step 1: Deploy Infrastructure

```bash
# Deploy CloudFormation stack
aws cloudformation create-stack \
  --stack-name teamloop-voiceloop \
  --template-body file://cloudformation-template.yml \
  --parameters ParameterKey=BucketName,ParameterValue=teamloop-voiceloop \
  --capabilities CAPABILITY_NAMED_IAM

# Wait for stack creation
aws cloudformation wait stack-create-complete --stack-name teamloop-voiceloop
```

### Step 2: Get Stack Outputs

```bash
# Get CloudFront distribution ID
aws cloudformation describe-stacks \
  --stack-name teamloop-voiceloop \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text
```

### Step 3: Deploy Application

```bash
# Build the application
npm run build

# Deploy to S3
aws s3 sync dist/ s3://teamloop-voiceloop --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Step 4: Access Your Application

Your application will be available at:
```
https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net
```

## 🌐 Custom Domain Setup

### Step 1: Register Domain (if needed)
- Use Route 53 or external registrar
- Ensure domain is accessible

### Step 2: Request SSL Certificate
```bash
# Request certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# Get certificate ARN
aws acm list-certificates --region us-east-1
```

### Step 3: Deploy with Custom Domain
```bash
# Deploy CloudFormation stack with custom domain
aws cloudformation create-stack \
  --stack-name teamloop-voiceloop \
  --template-body file://cloudformation-template.yml \
  --parameters \
    ParameterKey=BucketName,ParameterValue=teamloop-voiceloop \
    ParameterKey=DomainName,ParameterValue=yourdomain.com \
    ParameterKey=CertificateArn,ParameterValue=arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID \
  --capabilities CAPABILITY_NAMED_IAM
```

## 🔧 Configuration Files

### Environment Variables
Create `.env.local` for production:
```env
# Production API endpoints
VITE_API_BASE_URL=https://your-api-domain.com

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4

# ElevenLabs Configuration
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
VITE_ELEVENLABS_MODEL=eleven_monolingual_v1

# VoiceLoop Configuration
VITE_VOICE_WAKE_WORD=hey teamloop
VITE_VOICE_TIMEOUT=5000
VITE_VOICE_CONFIDENCE_THRESHOLD=0.8

# Feature Flags
VITE_ENABLE_VOICE_COMMANDS=true
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_VOICE_TRANSCRIPTION=true
```

### Build Configuration
Update `vite.config.ts` for production:
```typescript
export default defineConfig({
  base: '/', // or custom path if needed
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*'],
        },
      },
    },
  },
  // ... other config
})
```

## 📱 Testing Your Deployment

### VoiceLoop Testing
1. **Navigate to Dashboard**: `/dashboard`
2. **Click VoiceLoop Button**: Top-right corner
3. **Test Commands**:
   - `"Help"` - Get available commands
   - `"Check my PTO balance"` - Test PTO functionality
   - `"Give me wellness tips"` - Test wellness features
   - `"Show cost insights"` - Test cost analysis

### Browser Compatibility
- **Chrome**: Full voice support ✅
- **Edge**: Good voice support ✅
- **Firefox**: Limited voice support ⚠️
- **Safari**: Basic voice support ⚠️

### Common Issues
- **Voice not working**: Check microphone permissions
- **API errors**: Verify environment variables
- **Build failures**: Clear cache and reinstall dependencies

## 🔄 Continuous Deployment

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        VITE_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        VITE_ELEVENLABS_API_KEY: ${{ secrets.ELEVENLABS_API_KEY }}
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to S3
      run: aws s3 sync dist/ s3://teamloop-voiceloop --delete
    
    - name: Invalidate CloudFront
      run: |
        DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
          --stack-name teamloop-voiceloop \
          --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
          --output text)
        aws cloudfront create-invalidation \
          --distribution-id $DISTRIBUTION_ID \
          --paths "/*"
```

## 💰 Cost Optimization

### S3 Costs
- **Storage**: ~$0.023 per GB/month
- **Requests**: ~$0.0004 per 1,000 GET requests
- **Data Transfer**: Free for CloudFront

### CloudFront Costs
- **Data Transfer**: ~$0.085 per GB (first 10TB)
- **Requests**: ~$0.0075 per 10,000 requests
- **Price Class**: Use PriceClass_100 for cost optimization

### Estimated Monthly Costs
- **Low Traffic** (<1GB/month): $1-5
- **Medium Traffic** (1-10GB/month): $5-20
- **High Traffic** (10+GB/month): $20+

## 🔒 Security Considerations

### S3 Bucket Security
- **Public Read Access**: Required for static hosting
- **Block Public Write**: Ensure no public write access
- **Bucket Policies**: Restrict to necessary actions only

### CloudFront Security
- **HTTPS Only**: Redirect HTTP to HTTPS
- **Security Headers**: Add security headers
- **Geographic Restrictions**: If needed

### API Security
- **Environment Variables**: Never commit API keys
- **CORS Configuration**: Restrict to necessary origins
- **Rate Limiting**: Implement on backend

## 📊 Monitoring and Analytics

### CloudWatch Metrics
- **S3 Metrics**: Request count, error rate
- **CloudFront Metrics**: Cache hit ratio, error rate
- **Custom Metrics**: Voice command usage

### Application Monitoring
- **Voice Command Analytics**: Track usage patterns
- **Error Tracking**: Monitor voice recognition failures
- **Performance Metrics**: Load times, response times

## 🆘 Troubleshooting

### Common Deployment Issues

#### **Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### **S3 Sync Issues**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify bucket exists
aws s3 ls s3://teamloop-voiceloop
```

#### **CloudFront Issues**
```bash
# Check distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Invalidate cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Getting Help
- **Documentation**: Check this guide and README
- **GitHub Issues**: Report bugs and feature requests
- **AWS Support**: For infrastructure issues
- **Teamloop Support**: hello@teamloop.com

## 🎉 Success Indicators

When deployment is successful, you should see:
- ✅ Application loads without errors
- ✅ VoiceLoop button responds to clicks
- ✅ Voice commands are processed
- ✅ AI Assistant accepts input
- ✅ Dashboard displays correctly
- ✅ No console errors

## 🚀 Next Steps

After successful deployment:
1. **Test all VoiceLoop features**
2. **Monitor performance and costs**
3. **Set up monitoring and alerts**
4. **Plan for scaling and optimization**
5. **Consider custom domain setup**

---

**🎯 Your Teamloop + VoiceLoop is now live and ready to revolutionize HR management!**

For additional support, contact the development team or check the project documentation.
