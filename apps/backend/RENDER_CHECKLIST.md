# ✅ Render Deployment Checklist

## Critical Fixes Applied
- [x] Fixed `npm start` script to use correct path: `dist/src/index.js`
- [x] Added Prisma generate to build process
- [x] Updated render.yaml configuration

## 🚀 To Deploy on Render - Follow These Steps:

### 1. Commit Changes
```bash
git add .
git commit -m "fix: update start script and render config for deployment"
git push
```

### 2. Create/Update Render Web Service

Go to https://dashboard.render.com/

#### If Creating New Service:
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Enter these settings:
   - **Root Directory**: `ecommerce-enterprise-project/apps/backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

#### If Service Already Exists:
1. Go to your service in Render dashboard
2. Check Settings → Build & Deploy
3. Verify:
   - Root Directory: `ecommerce-enterprise-project/apps/backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

### 3. Set Environment Variables

Go to **Environment** tab and add these variables:

#### Required (Set these first!)

| Variable | Example Value | Where to Get It |
|----------|---------------|-----------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Your Render PostgreSQL service |
| `JWT_SECRET` | `long-random-string-32-chars-minimum` | Generate: `openssl rand -hex 32` |
| `EMAIL_USER` | `your-email@gmail.com` | Your Gmail |
| `EMAIL_PASSWORD` | `app-specific-password` | [Google App Passwords](https://myaccount.google.com/apppasswords) |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your deployed frontend URL |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Same as frontend URL (add multiple with commas) |

#### Auto-set by Render
- `PORT` - Automatically set (don't add this)
- `NODE_ENV=production` - Set in render.yaml

#### Optional (Already have defaults)
- `EMAIL_SERVICE=gmail` - Already in render.yaml
- `SMTP_HOST=smtp.gmail.com` - Already in render.yaml
- `SMTP_PORT=587` - Already in render.yaml

### 4. Create PostgreSQL Database (if needed)

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name it (e.g., `smartshop-db`)
3. Choose Free tier or paid
4. Click **Create Database**
5. Wait for provisioning
6. Copy the **Internal Database URL**
7. Paste it as `DATABASE_URL` in your web service environment variables

### 5. Deploy & Run Migrations

After setting all env variables:

1. **Manual Redeploy**: Go to your service → **Manual Deploy** → **Deploy latest commit**
2. **Watch Logs**: Click on **Logs** tab to see build progress
3. Look for: `✅ Backend API running!`

Once deployed, run migrations:
1. Go to your service → **Shell** tab
2. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # Optional: seed initial data
   ```

### 6. Test Your API

```bash
# Health check
curl https://smartshop-api-xd40.onrender.com/

# Should return: ✅ Backend API running!

# Test products endpoint
curl https://smartshop-api-xd40.onrender.com/api/products
```

### 7. Update Frontend

Once backend is working, update your frontend:

**For Vercel/Production:**
```env
# .env.production
NEXT_PUBLIC_API_URL=https://smartshop-api-xd40.onrender.com
```

**For Local Development:**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🔍 Troubleshooting

### Issue: "Application failed to respond"
**Check:**
- [ ] All required env variables are set
- [ ] DATABASE_URL is correct (use Internal URL if DB on Render)
- [ ] JWT_SECRET is at least 22 characters
- [ ] Build completed successfully (check logs)

### Issue: "Database connection error"
**Fix:**
- Use **Internal Database URL** (not External)
- Format: `postgresql://user:password@hostname:5432/database`
- Ensure database is running and accessible

### Issue: "CORS error from frontend"
**Fix:**
- Add your frontend URL to `CORS_ORIGINS`
- Example: `https://myapp.vercel.app,https://www.mydomain.com`
- No spaces between URLs

### Issue: Service sleeps after 15 min (Free tier)
**Expected Behavior:**
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid plan for always-on service

## 📊 Success Indicators

✅ Build logs show: `Build succeeded`  
✅ Start logs show: `📝 Server listening on port 5000`  
✅ Health check returns: `✅ Backend API running!`  
✅ No CORS errors when frontend makes requests  
✅ Products API returns data  

## 🎉 Deployment Complete!

Your backend should now be running at:
```
https://smartshop-api-xd40.onrender.com
```

Test it in your browser or with curl to confirm it's working!
