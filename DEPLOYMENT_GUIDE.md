# Deployment Guide - Vercel (Frontend) + Render (Backend)

## Overview

This guide provides step-by-step instructions for deploying the e-commerce application:
- **Frontend:** Next.js on Vercel
- **Backend:** Express API on Render

## Prerequisites

- GitHub account with the project repository
- Vercel account (free) 
- Render account (free or paid)
- PostgreSQL database (Render provides free PostgreSQL or use managed service)

---

## Backend Deployment on Render

### Step 1: Prepare your environment

1. Create a PostgreSQL database on Render or use an external database service:
   - Open [render.com](https://render.com)
   - Create a new PostgreSQL database
   - Copy the external database URL

2. Generate a strong JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - Name: `smartshop-backend`
   - Environment: `Node`
   - Plan: `Free` (or `Standard` for production)
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Instance Type: Keep default

5. Click "Create Web Service"

### Step 3: Set Environment Variables in Render

In Render dashboard, go to your service → Environment:

```
DATABASE_URL = postgresql://user:password@host:port/dbname
JWT_SECRET = (your-generated-secret-from-above)
PORT = 5000
NODE_ENV = production
EMAIL_SERVICE = gmail
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-app-password
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
EMAIL_FROM_NAME = SmartShop
FRONTEND_URL = https://your-vercel-frontend.vercel.app
CORS_ORIGINS = https://your-vercel-frontend.vercel.app,https://www.yourvercel-frontend.vercel.app
```

### Step 4: Email Setup

If using Gmail:

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select App: "Mail" and Device: "Other (custom name)"
3. Copy the generated app password
4. Set `EMAIL_PASSWORD` in Render with this app password

### Step 5: Verify Backend

After deployment:
1. Check Render logs for errors: Dashboard → Logs
2. Visit `https://your-backend-url.onrender.com/` - should show "✅ Backend API running!"
3. Test API: `https://your-backend-url.onrender.com/api/test`

**Note:** Render may take 5-10 minutes for the service to be ready after first deployment.

---

## Frontend Deployment on Vercel

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository and click "Import"

### Step 2: Configure Project Settings

In Vercel dashboard:

1. **Root Directory:** Select `./apps/frontend`
2. **Framework Preset:** Next.js (should auto-detect)
3. **Build Command:** `next build`
4. **Output Directory:** `.next`

### Step 3: Set Environment Variables in Vercel

In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://your-render-backend.onrender.com
```

**Important:** Make sure this starts with `NEXT_PUBLIC_` so it's visible to the browser.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. You'll get a preview URL: `https://your-project.vercel.app`

### Step 5: Verify Frontend

After deployment:
1. Visit your Vercel URL
2. The application should load with your Render backend
3. Try logging in, adding products to cart, etc.

---

## Connecting Frontend to Backend

The frontend will automatically use the backend API from the environment variable.

### In Development (Local)

```bash
# .env.local in frontend/
NEXT_PUBLIC_API_URL=http://localhost:5000

# Run backend separately
cd apps/backend && npm run dev

# Run frontend
cd apps/frontend && npm run dev
```

### In Production

The frontend's `vercel.json` and `.env.example` are configured to use:
```
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.app
```

This is set in Vercel's environment variables.

---

## Common Issues & Solutions

### Issue: "CORS error" on frontend

**Solution:** 
1. Check that `CORS_ORIGINS` is set correctly in Render
2. Ensure it includes your Vercel frontend URL
3. Restart the Render service

### Issue: Backend taking too long to respond

**Solution:** 
- Free tier on Render takes 50 seconds to spin up after inactivity
- Upgrade to standard for better performance
- Or use a cron job to keep it warm

### Issue: "Failed to fetch from API"

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` in Vercel is correct
2. Verify backend service is running on Render
3. Check CORS configuration in backend
4. Ensure DATABASE_URL is correct on Render

### Issue: Pages not loading after deployment

**Solution:**
1. Check Vercel build logs for errors
2. Ensure all environment variables are set
3. Run `npm run build` locally to test

### Issue: Database connection failed

**Solution:**
1. Verify DATABASE_URL is correct (check version: postgresql vs postgres)
2. Ensure database service is running on Render
3. Test connection string locally first

---

## Performance Tips

1. **Cold Starts:**
   - Render free tier suspends after 15 min of inactivity
   - Upgrade to standard tier for production

2. **Vercel:**
   - Free tier is sufficient for most projects
   - Database queries will be on Render, so latency is minimal

3. **Database:**
   - Use indexed queries
   - Keep connections pooled
   - Monitor query performance

---

## Monitoring & Debugging

### Vercel Logs
- Dashboard → Deployments → Logs
- See real-time frontend errors

### Render Logs  
- Dashboard → Logs
- See backend request logs and errors

### Database Logs
- Render PostgreSQL dashboard
- Monitor slow queries

---

## Auto-Deployment Setup

Both Vercel and Render support automatic deployment:

1. **Vercel:** Automatically deploys on git push to main branch
2. **Render:** Set in `render.yaml` with `autoDeploy: true`

To deploy:
```bash
git add .
git commit -m "your message"
git push origin main
```

This will trigger automatic deployments on both Vercel and Render.

---

## Rollback

### Vercel Rollback
1. Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

### Render Rollback
1. Dashboard → Logs
2. Find the previous successful deploy
3. Manually trigger a new deploy or check git history

---

## Custom Domain Setup

### Vercel Custom Domain
1. Dashboard → Settings → Domains
2. Add your domain
3. Follow DNS instructions

### Render Custom Domain
1. Dashboard → Settings → Custom Domain
2. Add your domain
3. Update CORS_ORIGINS to include new domain

---

## Security Checklist

- [ ] `.env` file is in `.gitignore` and never committed
- [ ] All secrets are set in Vercel and Render dashboards
- [ ] `FRONTEND_URL` and `CORS_ORIGINS` are set correctly
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database URL is kept secure in Render
- [ ] Email credentials are using app passwords (not main password)
- [ ] HTTPS is enabled (automatic on Vercel and Render)

---

## Support & Resources

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Render Docs: [render.com/docs](https://render.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Express Docs: [expressjs.com](https://expressjs.com)

---

**Last Updated:** March 5, 2026
