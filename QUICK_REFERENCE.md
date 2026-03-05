# Production Deployment Quick Reference

**Quick links and commands for production deployment**

---

## 🔗 Important URLs

### Development (Local)
```
Frontend:  http://localhost:3000
Backend:   http://localhost:5000
Database:  localhost:5432 (PostgreSQL)
```

### Production (After Deployment)
```
Frontend:  https://[your-project-name].vercel.app
Backend:   https://[your-project-name].onrender.com
Database:  Managed by Render (connection string provided)
```

---

## 📋 Environment Variables Template

### Backend .env (create in `apps/backend/.env`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db?schema=public

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-token-minimum-32-characters-long-recommended-64

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM_NAME=SmartShop

# Frontend URL
FRONTEND_URL=http://localhost:3000

# CORS - comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**For Production (set in Render dashboard, not as file):**
```
DATABASE_URL=postgresql://[render-provided-url]
PORT=5000
NODE_ENV=production
JWT_SECRET=[strong-32+-char-secret]
EMAIL_USER=[gmail-address]
EMAIL_PASSWORD=[gmail-app-password]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM_NAME=SmartShop
FRONTEND_URL=https://[your-vercel-url].vercel.app
CORS_ORIGINS=https://[your-vercel-url].vercel.app
```

### Frontend .env.local (create in `apps/frontend/.env.local`)

```bash
# Local development
NEXT_PUBLIC_API_URL=http://localhost:5000

# Production - set in Vercel dashboard, not as file
NEXT_PUBLIC_API_URL=https://[your-render-backend].onrender.com
```

---

## 🚀 Deployment Commands

### 1. Pre-Deployment Prep

```bash
# From project root

# Ensure all changes are committed
git add .
git commit -m "chore: production configuration ready for deployment"

# Verify environment files are safe
git check-ignore apps/backend/.env
# Expected output: apps/backend/.env (indicates it's ignored)

# Verify no .env in git history
git log --all -- apps/backend/.env | wc -l
# Expected output: 0 (no .env files in history)

# Build both projects
npm run build  # From root, or build each separately
```

### 2. Vercel Frontend Deployment

```bash
# Option A: Using GitHub (Recommended)
# 1. Push to GitHub:
git push origin main

# 2. Go to https://vercel.com/dashboard
# 3. Click "New Project"
# 4. Import your GitHub repository
# 5. In "Framework Preset" select "Next.js"
# 6. In "Root Directory" enter: "apps/frontend"
# 7. In "Environment Variables" add:
#    Key: NEXT_PUBLIC_API_URL
#    Value: https://[your-render-backend].onrender.com
# 8. Click "Deploy"

# Option B: Using Vercel CLI
cd apps/frontend
npm i -g vercel  # If not already installed
vercel
# Follow prompts to link and deploy
```

### 3. Render Backend Deployment

```bash
# Option A: Using GitHub (Recommended)
# 1. Push to GitHub:
git push origin main

# 2. Go to https://dashboard.render.com
# 3. Click "New +"
# 4. Select "Web Service"
# 5. Connect GitHub account and select repository
# 6. In "Root Directory" enter: "apps/backend"
# 7. In "Environment" tab, add all required variables:
#    - DATABASE_URL (from Render Postgres)
#    - JWT_SECRET
#    - All EMAIL_* variables
#    - FRONTEND_URL (your Vercel URL)
#    - CORS_ORIGINS (your Vercel URL)
# 8. Click "Create Web Service"

# Render automatically:
# - Detects render.yaml
# - Runs: npm run build
# - Runs: npm start
# - Provides DATABASE_URL for PostgreSQL

# Option B: Manual Setup
# 1. Create new PostgreSQL database on Render
# 2. Copy DATABASE_URL from Render dashboard
# 3. Paste into backend Web Service environment variables
# 4. Trigger deployment
```

---

## 🔑 Generation Commands

### Generate Strong JWT_SECRET

```bash
# macOS/Linux:
openssl rand -base64 32

# Windows PowerShell:
[Convert]::ToBase64String((1..32 | % {[byte](Get-Random -Minimum 0 -Maximum 256)})) | ForEach-Object {$_.Replace('+', '-').Replace('/', '_').Replace('=', '')}

# Online (if needed):
# Go to: https://tools.keycdn.com/random
# Copy 64 characters (base64)
```

**Expected:** 32+ character random string  
**Example:** `KxYzP9mQ2fL7vN3bJ8dH6gT1wS4aC5oE`

### Get Gmail App Password

```
1. Go to: https://myaccount.google.com/apppasswords
2. Select: Mail, Windows Computer (or your device)
3. Google generates: 16 character password
4. Copy this password
5. Use as EMAIL_PASSWORD in backend env
```

**Expected:** 16 character code like: `abcd efgh ijkl mnop`  
**Note:** This is NOT your Gmail account password

---

## 📊 File Structure After Deployment

### Frontend (Vercel)
```
apps/frontend/
├── .env.local          (NOT in git, only on local machine)
├── .env.example        (IN git, no secrets)
├── vercel.json         (Build config - auto-detected)
├── next.config.ts      (Next.js config)
├── package.json
├── app/                (Next.js pages)
├── components/         (React components)
├── lib/
│   ├── config.ts       (API config - CENTRALIZED)
│   ├── axios.ts        (Axios instance)
│   └── api.ts          (API functions)
└── .next/              (Build output - auto-generated)
```

### Backend (Render)
```
apps/backend/
├── .env                (NOT in git, only on Render)
├── .env.example        (IN git, no secrets)
├── render.yaml         (Render config - auto-detected)
├── package.json
├── src/
│   ├── index.ts        (Server startup - CORS config here)
│   ├── app.ts          (Express middleware - CORS applied)
│   ├── api/            (API routes)
│   ├── services/       (Business logic)
│   └── utils/          (Helper functions)
├── prisma/
│   ├── schema.prisma   (Database schema)
│   └── migrations/     (Database changes)
└── dist/               (Build output - auto-generated)
```

---

## 🔍 Testing After Deployment

### 1. Verify Frontend is Running
```bash
# Open in browser:
https://[your-project].vercel.app

# Should see:
# - Homepage loads
# - No 404 errors
# - Products displayed
```

### 2. Verify Backend is Running
```bash
# In terminal:
curl https://[your-backend].onrender.com/

# Or visit directly in browser:
https://[your-backend].onrender.com/

# Alternative test using JavaScript:
fetch('https://[your-backend].onrender.com/api/products')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 3. Test User Registration
```
1. Go to frontend URL
2. Click "Register"
3. Fill form (email, password, name)
4. Should see success message
5. Check backend logs for database insert
6. Database should contain new user
```

### 4. Test User Login
```
1. Go to frontend URL
2. Click "Login"
3. Enter registered email and password
4. Should see success
5. Token should be stored in browser localStorage
6. Should redirect to dashboard/home
```

### 5. Test API Connectivity
```
1. Logged in on frontend
2. Go to any protected route (/my-profile, /cart, etc.)
3. Data should load from backend API
4. No CORS errors in browser console
5. Network requests should succeed (200 status)
```

### 6. Test Email (Forgot Password)
```
1. Go to login page
2. Click "Forgot Password"
3. Enter registered email
4. Should see "Check your email"
5. Check email inbox
6. Click reset link
7. Reset password
8. Login with new password
```

---

## 🐛 Quick Troubleshooting

### Frontend Shows "API Error"
```
Check:
1. NEXT_PUBLIC_API_URL in Vercel dashboard is correct
2. Render backend service is running (check Render logs)
3. Browser console for CORS errors
4. API endpoint with curl:
   curl https://[your-backend].onrender.com/api/products
```

### "Access-Control-Allow-Origin" Error
```
Fix:
1. Check CORS_ORIGINS in Render backend environment
2. Ensure it matches Vercel frontend URL exactly
3. Wait a minute for Render to redeploy
4. Hard refresh browser (Ctrl+Shift+R)
5. Check Render logs: "CORS configured for:"
```

### Login Fails with "Invalid Credentials"
```
Check:
1. User exists in production database
2. JWT_SECRET is strong and consistent
3. Database is accessible (check Render logs)
4. Email/password is correct
```

### Emails Not Sending
```
Check:
1. EMAIL_USER is your Gmail address
2. EMAIL_PASSWORD is app-specific password (not account password)
3. 2FA is enabled on Gmail account
4. App password was created at: myaccount.google.com/apppasswords
5. Backend logs show email attempt
6. Check spam folder
```

---

## 📈 Performance Tips

### Frontend (Vercel)
- Use NextImage for images (`next/image`)
- Enable automatic code splitting (Next.js does this)
- Monitor Vercel Analytics dashboard
- Use serverless functions for API routes
- Set proper cache headers in vercel.json

### Backend (Render)
- Use connection pooling for database
- Keep API responses fast (< 1 second)
- Use middleware caching when appropriate
- Monitor Render metrics dashboard
- Scale up if needed from Render dashboard

---

## 📧 Email Configuration Details

### Gmail App Password (Recommended)

**Step-by-step:**
1. Go to https://myaccount.google.com/
2. Security tab (left sidebar)
3. Two-factor authentication (must be enabled)
4. App passwords (at bottom)
5. Select: Mail, Windows Computer (or your device)
6. Google generates: 16-char password
7. Copy all 16 characters (ignore spaces)
8. Use as EMAIL_PASSWORD in Render environment

**Example .env:**
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # 16 characters
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

**Why app password?**
- More secure than account password
- Can be revoked without changing account password
- Gmail specifically designed for apps

---

## 🔄 Auto-Deployment Setup

### Vercel (Automatic)
- Already configured
- Deployment triggers any GitHub push
- Preview deployments for PRs
- Production deployment on main branch merge
- Check rollback button in Vercel dashboard

### Render (Configured in render.yaml)
```yaml
services:
  - name: smartshop-backend
    deploy:
      startCommand: npm start        # Auto-starts after deployment
```

- Deployment triggers any GitHub push to main
- Render reads render.yaml automatically
- Watch deployment logs in Render dashboard
- Configure automatic redeploy in dashboard (if desired)

---

## 📞 Support & Monitoring

### View Live Logs

#### Vercel
```
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments" tab
4. Click recent deployment
5. View real-time logs
```

#### Render
```
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Logs" tab
4. View real-time logs (searches available)
```

### Common Log Messages

**Vercel (Frontend):**
```
- "Build completed successfully" = Ready to serve
- "Error: failed to load configuration" = Check vercel.json
- "ENOENT: no such file" = Check root directory in project settings
```

**Render (Backend):**
```
- "Server running on port 5000" = Backend started
- "✅ Database connection successful" = DB connected
- "❌ FATAL: Missing required environment variables" = Missing env var
- "CORS configured for:" = Shows allowed origins
```

---

## 📋 Post-Deployment Checklist

After both services deployed:

- [ ] Frontend loads without 404
- [ ] Backend API responds to curl
- [ ] User can register
- [ ] User can login
- [ ] API calls work (no CORS errors)
- [ ] Email works (forgot password)
- [ ] Dashboard/profile page loads data
- [ ] Product pages load
- [ ] Add to cart works
- [ ] Checkout flow works
- [ ] Logs show no errors
- [ ] Performance is acceptable (< 3 sec load time)

---

## 🎯 Estimated Timeline

- **Preparation:** 5-10 minutes
- **Vercel Deployment:** 3-5 minutes
- **Render Deployment:** 5-10 minutes
- **Verification:** 5-10 minutes
- **Total:** 20-35 minutes

---

## 🆘 Emergency Contacts

- **Vercel Support:** https://vercel.com/support
- **Render Support:** https://support.render.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Node.js Docs:** https://nodejs.org/docs/

---

**Last Updated:** March 5, 2026  
**Status:** Production Ready ✅
