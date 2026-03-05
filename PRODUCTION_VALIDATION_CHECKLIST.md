# Production Validation Checklist

Complete this checklist before deploying to Vercel and Render.

---

## 🔐 Security Checks

### Environment Variables Protection
- [ ] `.env` file exists and is in `.gitignore`
- [ ] Verify with: `git check-ignore apps/backend/.env`
- [ ] `.env.example` files exist without sensitive data
- [ ] Command to verify no .env in git history:
  ```bash
  git log --all -- apps/backend/.env | grep -q "." && echo "DANGER: .env found in history" || echo "✓ Safe"
  ```

### Secret Management
- [ ] JWT_SECRET is at least 32 characters
  ```bash
  # Test on backend startup - should see "✅ JWT_SECRET strength validated"
  ```
- [ ] Database credentials only in .env (not in code)
- [ ] Email password is app-specific password (not account password)
- [ ] No hardcoded secrets in any source files
  ```bash
  # Search for hardcoded literals:
  grep -r "mongodb://\|postgresql://\|your-secret\|YOUR_SECRET" --include="*.ts" --include="*.tsx" apps/
  ```

---

## 🔗 CORS Configuration Verification

### Local Development Test
```bash
# Terminal 1: Start backend
cd apps/backend
npm start
# Should see: "✅ CORS configured for: http://localhost:3000, http://localhost:3001"

# Terminal 2: Start frontend
cd apps/frontend
npm run dev
# Navigate to http://localhost:3000
# Try login/signup - API calls should work
# Check browser DevTools Network tab - CORS headers should be present
```

### Production CORS Test (After Deployment)
```bash
# After deploying to Render, set in Render dashboard:
CORS_ORIGINS=https://your-vercel-frontend.vercel.app

# Restart Render backend
# Verify in logs: "✅ CORS configured for: https://your-vercel-frontend.vercel.app"

# Test from Vercel frontend - API calls should work
# If blocked, check browser DevTools Console for CORS errors
```

**Expected Result:**
- Development: Both localhost:3000 and localhost:3001 are allowed
- Production: Only Vercel URL is allowed (exact domain)
- No hardcoded CORS errors in browser console

---

## 🗄️ Database Connection Test

### Backend Startup Validation
```bash
# Backend should validate database immediately on startup
cd apps/backend

# Test with missing DATABASE_URL:
# 1. Remove DATABASE_URL from .env
# 2. npm start
# Expected: "❌ FATAL: Missing required environment variables: DATABASE_URL"
# Exit code: 1

# Test with correct DATABASE_URL:
# 1. Restore DATABASE_URL in .env
# 2. npm start
# Expected: "✅ Database connection successful" (or similar)
# Server starts on port 5000
```

### Prisma Verification
```bash
cd apps/backend

# Check schema is valid:
npx prisma validate

# Check migrations are up-to-date:
npx prisma migrate status

# If needed, run migrations:
npx prisma migrate deploy
```

---

## 🔑 JWT & Authentication Test

### JWT Secret Validation
```bash
# Backend startup should validate JWT_SECRET:
cd apps/backend

# Test with weak JWT_SECRET (< 22 chars):
# 1. Set JWT_SECRET=short (in .env temporarily)
# 2. npm start
# Expected: "❌ FATAL: JWT_SECRET must be at least 22 characters"
# Exit code: 1

# Test with strong JWT_SECRET:
# 1. Set JWT_SECRET=your-super-secret-key-minimum-32-characters-long
# 2. npm start
# Expected: No error, server starts
```

### Authentication Flow Test
```bash
# With frontend and backend running:

# 1. Register new user:
# - Go to http://localhost:3000/register
# - Fill form and submit
# - Expected: Successful registration, redirected to login

# 2. Login:
# - Go to http://localhost:3000/login
# - Enter credentials
# - Expected: Token received, stored in localStorage, redirected to home

# 3. Verify token:
# - Open DevTools > Application > LocalStorage
# - Should see 'token' key with JWT value
# - JWT format: xxxxx.xxxxx.xxxxx (three parts with dots)

# 4. Test authenticated request:
# - Go to /my-profile or /cart
# - Page should load user data from API
# - No 401 errors in console

# 5. Test token expiration:
# - Wait for token to expire (or manually clear localStorage)
# - Try accessing protected page
# - Should redirect to login
```

---

## 📧 Email Configuration Test

### Gmail App Password Setup
```bash
# Follow Gmail setup steps:
# 1. Enable 2FA on Google Account
# 2. Generate app password at myaccount.google.com/apppasswords
# 3. Set in backend .env:
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxxxxxxxxxxxxxx

# Test email sending:
# 1. Trigger forgot password flow
# 2. Enter email address
# 3. Check Gmail sends reset email
# 4. Verify email is from EMAIL_FROM_NAME (SmartShop)
# 5. Click reset link and verify password change works

# If email fails:
# - Check EMAIL_USER and EMAIL_PASSWORD in .env
# - Verify app-specific password (not account password)
# - Check backend logs for SMTP errors
# - Ensure Less Secure Apps is enabled (if not using app password)
```

---

## 🌐 API Configuration Test

### Frontend API Calls
```bash
# Verify all API calls use centralized config:

# 1. Check lib/config.ts is properly configured:
cat apps/frontend/lib/config.ts | grep "NEXT_PUBLIC_API_URL"
# Should show: NEXT_PUBLIC_API_URL env var with fallback

# 2. Check axios uses config:
cat apps/frontend/lib/axios.ts | grep "baseURL"
# Should show: baseURL uses API_URL from config

# 3. Test with wrong API URL:
# - Set NEXT_PUBLIC_API_URL=http://localhost:9999 (wrong port)
# - npm run dev
# - Try login
# - Expected: Connection error, not API functioning
# - Change back to correct URL, refresh, try again
# - Expected: Works again

# 4. Verify no hardcoded URLs in app code:
grep -r "localhost:5000\|localhost:3000\|smartshop" --include="*.tsx" --include="*.ts" apps/frontend/app/ apps/frontend/components/
# Should return few matches, only in safe places (lib/config.ts comments, .env.example)
```

### API Response Test
```bash
# Test with curl to verify backend API:

# Check if backend is running:
curl http://localhost:5000/

# Should include CORS headers in response:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Credentials: true

# Test with frontend request:
# In browser console:
fetch('http://localhost:5000/api/products', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(d => console.log(d))

# Should return products array (or empty array if no products)
# No CORS error
```

---

## 🏗️ Build Verification

### Frontend Build
```bash
cd apps/frontend

# Clean previous build:
rm -rf .next

# Run build:
npm run build

# Expected:
# - Creates .next directory
# - No TypeScript errors
# - No ESLint errors
# - Build successful
# - Ready for standalone deployment

# Verify build output:
ls -la .next/
# Should contain: standalone/, static/, etc.
```

### Backend Build
```bash
cd apps/backend

# Clean previous build:
rm -rf dist

# Run build:
npm run build

# Expected:
# - Creates dist directory
# - No TypeScript errors
# - All .ts files compiled to .js
# - dist/src contains compiled source
# - Ready for deployment

# Verify build output:
ls -la dist/src/
# Should have compiled JavaScript files
```

---

## 📦 Dependency Check

### Frontend Dependencies
```bash
cd apps/frontend

# List outdated packages:
npm outdated

# Expected: Most dependencies should be current
# Acceptable to be 1-2 minor versions behind

# Check for vulnerabilities:
npm audit

# Expected: No vulnerabilities
# If vulnerabilities found: npm audit fix
```

### Backend Dependencies
```bash
cd apps/backend

# Check dependencies:
npm outdated

# Check for vulnerabilities:
npm audit

# Expected: No critical vulnerabilities
# Acceptable: Low-severity that don't affect security
```

---

## 🚀 Pre-Deployment Environment Setup

### Local Environment Files
```bash
# Frontend .env.local
cat apps/frontend/.env.local
# Expected contents:
# NEXT_PUBLIC_API_URL=http://localhost:5000 (or your backend URL)

# Backend .env
cat apps/backend/.env
# Expected: Has all required variables
# NEVER USE .env FILES IN PRODUCTION - use Vercel/Render dashboards instead
```

### Production Environment Variables Prepared

#### Vercel Dashboard Variables
- [ ] Go to Vercel Project Settings > Environment Variables
- [ ] Set variables for all environments (Preview, Production):
  ```
  NEXT_PUBLIC_API_URL = https://your-render-backend.onrender.com
  ```
- [ ] Save and deploy

#### Render Dashboard Variables  
- [ ] Go to Render Service Settings > Environment
- [ ] Set all required variables:
  ```
  DATABASE_URL = postgresql://... (from Render Database)
  JWT_SECRET = (32+ character secret)
  PORT = 5000
  NODE_ENV = production
  EMAIL_USER = your-email@gmail.com
  EMAIL_PASSWORD = app-specific-password
  SMTP_HOST = smtp.gmail.com
  SMTP_PORT = 587
  EMAIL_FROM_NAME = SmartShop
  FRONTEND_URL = https://your-vercel-frontend.vercel.app
  CORS_ORIGINS = https://your-vercel-frontend.vercel.app
  ```
- [ ] Save and trigger redeploy

---

## ✅ Deployment Readiness Check

### Before Pushing to GitHub
```bash
# 1. Verify no .env files will be committed:
git status | grep ".env"
# Expected: No .env files shown

# 2. Verify .gitignore is working:
git check-ignore apps/backend/.env
# Expected: apps/backend/.env (confirms it's ignored)

# 3. Run final build locally:
npm run build (from root)
# Expected: Both frontend and backend build successfully

# 4. Start both servers and test manually:
# Terminal 1: cd apps/backend && npm start
# Terminal 2: cd apps/frontend && npm run dev
# Manual test: Register, login, add to cart, checkout flow
```

### Final Pre-Deployment Verification
- [ ] All source code is TypeScript valid
  ```bash
  npx tsc --noEmit
  ```
- [ ] No console errors on frontend
- [ ] No API errors on backend startup
- [ ] Database migrations are up to date
- [ ] Email configuration tested and working
- [ ] JWT secret is strong (32+ characters)
- [ ] CORS_ORIGINS set for production domain
- [ ] No hardcoded secrets in any file
- [ ] .env files in .gitignore
- [ ] Git history has no .env files

---

## 📊 Deployment Tracking

### Frontend Deployment (Vercel)
- [ ] Code pushed to GitHub
- [ ] Vercel detected changes
- [ ] Build started and completed successfully
- [ ] Deployment preview created
- [ ] Visit preview URL works
- [ ] Environment variables applied
- [ ] Production deployment triggered
- [ ] API calls working (check DevTools Network/Console)
- [ ] CORS errors? Check NEXT_PUBLIC_API_URL value

### Backend Deployment (Render)
- [ ] Code pushed to GitHub
- [ ] Render detected changes
- [ ] Build started and completed successfully
- [ ] Environment variables configured in dashboard
- [ ] Service redeployed with new variables
- [ ] Backend URL accessible (should return JSON)
- [ ] Database connected (check logs for connection messages)
- [ ] CORS configured with Vercel frontend URL
- [ ] Test API endpoint: `curl https://your-backend.onrender.com/api/products`

---

## 🐛 Troubleshooting Guide

### API Calls Failing in Production
```
Symptom: Vercel frontend shows "API Error" or blank page
Solution:
1. Check NEXT_PUBLIC_API_URL in Vercel Environment Variables
2. Verify Render backend is running (check Render logs)
3. Check CORS_ORIGINS includes Vercel domain
4. Check browser DevTools Console for errors
5. Test with curl: curl https://your-backend.onrender.com/api/products
```

### CORS Error in Browser
```
Symptom: "Access to XMLHttpRequest has been blocked by CORS policy"
Solution:
1. Check Render logs for actual origin being requested from
2. Verify CORS_ORIGINS in Render environment variables matches Vercel URL exactly
3. Restart Render backend after changing CORS_ORIGINS
4. Check respond includes Access-Control-Allow-Origin header
```

### Authentication Not Working
```
Symptom: Login fails, "Invalid credentials" despite correct password
Solution:
1. Check JWT_SECRET is same strong value in Render
2. Check DATABASE_URL is correct in Render
3. Verify user exists in production database
4. Check Render logs for error details
5. Restart Render backend
```

### Email Not Sending
```
Symptom: Forgot password doesn't send email
Solution:
1. Check EMAIL_USER and EMAIL_PASSWORD in Render
2. Verify app-specific password is used (not account password)
3. Check EMAIL_FROM_NAME is set
4. Check backend logs: "Email sent to xxx" should appear
5. Check spam folder in Gmail
6. Try triggering email feature again
```

---

## 📋 Final Checklist Before Going Live

- [ ] Local testing passed all flows
- [ ] Frontend builds successfully
- [ ] Backend builds successfully
- [ ] Database migrations applied
- [ ] Environment variables validated at startup
- [ ] CORS configuration verified
- [ ] JWT validation verified
- [ ] Email configuration tested
- [ ] Security: No secrets in code or git history
- [ ] Git .gitignore properly configured
- [ ] Vercel environment variables set
- [ ] Render environment variables set
- [ ] Production database created and accessible
- [ ] Both services successfully deployed
- [ ] API connectivity verified
- [ ] Manual user flow testing completed
- [ ] Frontend can read from backend
- [ ] Backend validates from frontend
- [ ] Authentication tokens working

---

**Status:** Ready for production when all checks are complete ✅

**Estimated Time:** 30-45 minutes to complete deployment and verification
