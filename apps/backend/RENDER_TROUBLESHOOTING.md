# 🔧 Render Backend Troubleshooting Guide

## Current Status: Backend Returning 404

This means your Render service is either:
1. Not deployed yet
2. Failed to deploy
3. Suspended/sleeping (free tier)
4. Misconfigured

---

## 🔍 Diagnostic Steps

### Step 1: Check Render Dashboard Status

Go to: https://dashboard.render.com/

Find your service and check the status badge:

| Status | Meaning | Action |
|--------|---------|--------|
| 🟢 **Live** | Running normally | Check logs for errors |
| 🔵 **Deploying** | Currently building | Wait for completion |
| 🔴 **Deploy failed** | Build/start error | Check logs for errors |
| ⚪ **Suspended** | Free tier sleep | Wait 30s for wake-up |

---

### Step 2: Review Logs (Most Important!)

**Dashboard → Your Service → Logs**

#### Look for Success Messages:
```bash
==> Cloning from GitHub...
==> Running build command...
✓ Prisma schema loaded
✓ Generated Prisma Client  
✓ TypeScript compilation successful
==> Deploy successful!
==> Starting service...
📝 Server listening on port 5000
✅ Backend API running!
```

#### Common Error Patterns:

**❌ Error: "Cannot find module 'dist/index.js'"**
```
Solution: Already fixed! Make sure latest commit is deployed.
- Check: npm start script uses dist/src/index.js
- Manual Deploy → Deploy latest commit
```

**❌ Error: "Missing required environment variables"**
```
Solution: Add missing variables in Environment tab
Required:
- DATABASE_URL
- JWT_SECRET (min 32 chars)
- EMAIL_USER
- EMAIL_PASSWORD
- FRONTEND_URL
- CORS_ORIGINS
```

**❌ Error: "Database connection failed"**
```
Solution: Fix DATABASE_URL
- Use INTERNAL database URL (not external)
- Format: postgresql://user:pass@host:5432/database
- Check database is running
```

**❌ Error: "Port 5000 is already in use"**
```
Solution: Use process.env.PORT
- Render automatically sets PORT
- Your code already handles this correctly
```

**❌ Error: "JWT_SECRET must be at least 22 characters"**
```
Solution: Generate stronger secret
Command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Copy output to JWT_SECRET env var
```

---

### Step 3: Verify Environment Variables

**Dashboard → Your Service → Environment**

#### Required Variables Checklist:

```env
✓ DATABASE_URL=postgresql://user:password@host:5432/database
  └─ From: Render PostgreSQL service (use Internal URL)
  
✓ JWT_SECRET=64-character-hex-string-generated-randomly
  └─ Generate: openssl rand -hex 32
  
✓ EMAIL_USER=your-email@gmail.com
  └─ Your Gmail address
  
✓ EMAIL_PASSWORD=app-specific-password-16-chars
  └─ From: https://myaccount.google.com/apppasswords
  
✓ FRONTEND_URL=https://your-app.vercel.app
  └─ Your deployed frontend URL
  
✓ CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
  └─ All domains that will access your API (comma-separated)

Optional (already have defaults):
- EMAIL_SERVICE=gmail
- SMTP_HOST=smtp.gmail.com  
- SMTP_PORT=587
- EMAIL_FROM_NAME=SmartShop
```

**After adding/changing env vars:** Manual Deploy → Clear build cache & deploy

---

### Step 4: Verify Build Settings

**Dashboard → Your Service → Settings**

#### Root Directory:
```
ecommerce-enterprise-project/apps/backend
```
⚠️ Must match your GitHub repo structure!

#### Build Command:
```bash
npm install && npx prisma generate && npm run build
```
This ensures:
1. Dependencies installed
2. Prisma client generated
3. TypeScript compiled

#### Start Command:
```bash
npm start
```
Which runs: `node dist/src/index.js`

---

### Step 5: Check Database Connection

If you created a Render PostgreSQL database:

1. **Dashboard → Your PostgreSQL Database**
2. Check status: Should be **Available**
3. Copy the **Internal Database URL** (not External!)
4. Paste as `DATABASE_URL` in web service

#### Run Migrations:
After first successful deploy:
```bash
# In Render Shell (Dashboard → Your Service → Shell)
npx prisma migrate deploy
npx prisma db seed  # Optional: seed data
```

---

## 🚀 Deploy Workflow

### Option 1: Auto-Deploy (Recommended)
1. Make changes locally
2. Commit and push to GitHub
3. Render automatically deploys
4. Check logs for success

### Option 2: Manual Deploy
1. Dashboard → Your Service
2. Click **Manual Deploy**
3. Select **Deploy latest commit**
4. Watch logs

---

## 🧪 Testing After Deploy

### Browser Test:
```
https://your-service-name.onrender.com/
```
Should show: `✅ Backend API running!`

### PowerShell Test:
```powershell
# Health check
Invoke-WebRequest -Uri "https://your-service.onrender.com/" -UseBasicParsing

# Test endpoint
Invoke-WebRequest -Uri "https://your-service.onrender.com/api/test" -UseBasicParsing

# Products
Invoke-WebRequest -Uri "https://your-service.onrender.com/api/products" -UseBasicParsing
```

### cURL Test:
```bash
curl https://your-service.onrender.com/
curl https://your-service.onrender.com/api/test
curl https://your-service.onrender.com/api/products
```

---

## 🎯 Most Common Issues & Solutions

### Issue #1: 404 on All Endpoints
**Cause:** Service not started or wrong path
**Fix:**
- Check logs for startup errors
- Verify `npm start` script: `node dist/src/index.js`
- Redeploy latest commit

### Issue #2: Service Keeps Failing
**Cause:** Missing environment variables
**Fix:**
- Add all required env vars
- Clear build cache
- Manual deploy

### Issue #3: Free Tier Sleeping
**Cause:** No activity for 15 minutes (expected behavior)
**Fix:**
- First request takes ~30 seconds to wake
- Upgrade to paid plan for always-on
- Or use a ping service (uptime robot)

### Issue #4: Database Connection Errors
**Cause:** Wrong DATABASE_URL or database not running
**Fix:**
- Use Internal URL (from Render PostgreSQL)
- Ensure database status is "Available"
- Test connection in Shell: `npx prisma db pull`

### Issue #5: CORS Errors in Frontend
**Cause:** Frontend URL not in CORS_ORIGINS
**Fix:**
- Add frontend URL to CORS_ORIGINS
- Format: `https://app.vercel.app,https://www.domain.com`
- Redeploy after changing env vars

---

## 📊 Success Checklist

After deployment, verify:

- [ ] Service status: **Live** (green)
- [ ] Logs show: `📝 Server listening on port XXXX`
- [ ] Logs show: `✅ Backend API running!`
- [ ] Health endpoint returns 200: `/`
- [ ] Test endpoint works: `/api/test`
- [ ] Products endpoint works: `/api/products`
- [ ] No CORS errors from frontend
- [ ] Database connected (check logs)
- [ ] All auth endpoints working

---

## 🆘 Still Not Working?

### Get Service URL:
Dashboard → Your Service → Top of page shows full URL

### Check Exact Error:
Logs tab → Look for red error messages → Google the specific error

### Common Commands in Shell:
```bash
# Check if Prisma can connect
npx prisma db pull

# See environment variables (safe ones)
printenv | grep -v PASSWORD

# Check Node version
node --version

# Test TypeScript build
npm run build

# Check what files exist
ls -la dist/src/
```

### Need More Help?
1. Copy the error from Logs
2. Check which environment variables are missing
3. Verify your GitHub repo has the latest commits
4. Ensure `render.yaml` is in the backend folder

---

## 🎉 When Everything Works

You should see:
- ✅ Status: Live
- ✅ URL accessible: `https://your-service.onrender.com/`
- ✅ Returns: `✅ Backend API running!`
- ✅ All API endpoints responding
- ✅ Frontend can connect without CORS errors

**Your service is now deployed! 🚀**
