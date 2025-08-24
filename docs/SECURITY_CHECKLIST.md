# 🔒 Security Checklist for Teamloop + VoiceLoop

## 🚨 PRE-COMMIT SECURITY SCAN

**ALWAYS run this checklist before pushing to GitHub or deploying to production.**

### ✅ API Keys & Secrets
- [ ] **NO hardcoded API keys** in any source files
- [ ] **NO hardcoded passwords** or tokens
- [ ] **NO hardcoded database credentials**
- [ ] **NO hardcoded AWS credentials**
- [ ] All sensitive data uses environment variables
- [ ] `.env.local` file is in `.gitignore`

### ✅ Environment Files
- [ ] `env.dashboard` contains only template values
- [ ] `env.teamloop` contains only template values
- [ ] `.env.local` exists locally with real keys (NOT committed)
- [ ] All environment files are properly excluded in `.gitignore`

### ✅ Configuration Files
- [ ] `src/config/api.ts` contains NO real API keys
- [ ] All configuration uses environment variables
- [ ] No secrets in configuration files

### ✅ Dependencies
- [ ] `package-lock.json` is committed (for security audits)
- [ ] No suspicious packages in `node_modules/`
- [ ] All dependencies are from trusted sources

### ✅ Build & Deployment
- [ ] Production build works without environment variables
- [ ] No source maps in production (security)
- [ ] No debug information in production
- [ ] S3 bucket permissions are secure

## 🔍 SECURITY SCAN COMMANDS

### Quick Security Check
```bash
# Search for hardcoded API keys
grep -r "sk-proj-\|sk_\|api_key\|API_KEY" src/ --exclude-dir=node_modules

# Search for hardcoded secrets
grep -r "secret\|SECRET\|password\|PASSWORD\|token\|TOKEN" src/ --exclude-dir=node_modules

# Check for environment file leaks
grep -r "VITE_OPENAI_API_KEY\|VITE_ELEVENLABS_API_KEY" . --exclude-dir=node_modules --exclude="*.md"
```

### Pre-commit Hook (Optional)
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
echo "🔒 Running security scan..."
if grep -r "sk-proj-\|sk_\|api_key\|API_KEY" src/ --exclude-dir=node_modules; then
    echo "❌ SECURITY VIOLATION: Hardcoded API keys found!"
    exit 1
fi
echo "✅ Security scan passed"
```

## 🚀 DEPLOYMENT SECURITY

### S3 Bucket Security
- [ ] Bucket has appropriate public access settings
- [ ] Bucket policy allows only necessary actions
- [ ] No write access for public users
- [ ] HTTPS enforced (if using CloudFront)

### Environment Variables
- [ ] Production environment variables are secure
- [ ] API keys are rotated regularly
- [ ] No development keys in production
- [ ] Environment variables are encrypted in production

## 🆘 EMERGENCY PROCEDURES

### If API Keys Are Exposed
1. **IMMEDIATELY rotate the exposed API keys**
2. **Remove the commit from Git history**
3. **Notify team members**
4. **Audit all recent commits**
5. **Review access logs**

### If S3 Bucket is Compromised
1. **Disable public access immediately**
2. **Review bucket access logs**
3. **Check for unauthorized uploads**
4. **Rotate any exposed credentials**
5. **Review bucket policies**

## 📋 DAILY SECURITY PRACTICES

### Development
- [ ] Never commit `.env.local` files
- [ ] Use template files for configuration
- [ ] Test builds without environment variables
- [ ] Regular dependency security audits

### Deployment
- [ ] Verify environment variables before deployment
- [ ] Check S3 bucket permissions
- [ ] Monitor access logs
- [ ] Regular security reviews

## 🔐 SECURE DEVELOPMENT WORKFLOW

1. **Before coding**: Check out clean branch
2. **During development**: Use environment variables
3. **Before commit**: Run security scan
4. **Before push**: Verify no secrets in code
5. **Before deployment**: Verify production environment
6. **After deployment**: Monitor for issues

## 📞 SECURITY CONTACTS

- **Security Issues**: Create GitHub issue with [SECURITY] tag
- **Emergency**: Contact development team immediately
- **AWS Issues**: Contact AWS support if bucket compromised

---

**Remember: Security is everyone's responsibility. When in doubt, ask before committing!**
