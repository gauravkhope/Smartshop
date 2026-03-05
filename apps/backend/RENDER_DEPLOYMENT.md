# Render Deployment Guide

## ✅ Issue Fixed
The `start` script in package.json has been corrected to point to `dist/src/index.js`.

## 🚀 Deployment Steps

### 1. Prerequisites
- GitHub repository connected to Render
- PostgreSQL database on Render (or external)

### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `smartshop-backend` (or your choice)
   - **Root Directory**: `ecommerce-enterprise-project/apps/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 3. Required Environment Variables

Set these in Render Dashboard → Environment tab:

#### Database
```env
DATABASE_URL=postgresql://user:password@host:port/database
```
Get this from your Render PostgreSQL service or external database.

#### Security
```env
JWT_SECRET=your-super-long-random-secret-at-least-32-characters-long
```
Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### Email Configuration
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM_NAME=SmartShop
```

For Gmail, create an [App Password](https://myaccount.google.com/apppasswords).

#### CORS & Frontend
```env
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app,https://www.your-domain.com
```
Add all domains that will access your API (comma-separated).

#### Node Configuration
```env
NODE_ENV=production
```
Render sets `PORT` automatically.

### 4. Database Setup

If using Render PostgreSQL:
1. Create PostgreSQL instance on Render
2. Copy the **Internal Database URL**
3. Set as `DATABASE_URL` in your web service

After deployment, run Prisma migrations:
```bash
# In Render Shell (Dashboard → Your Service → Shell)
npx prisma migrate deploy
npx prisma db seed  # Optional: seed initial data
```

### 5. Health Check
Render will ping `https://your-app.onrender.com/` to check if the app is running.
Your backend responds with: `✅ Backend API running!`

### 6. Verify Deployment

Test your endpoints:
```bash
# Health check
curl https://smartshop-api-xd40.onrender.com/

# Products endpoint
curl https://smartshop-api-xd40.onrender.com/api/products

# Test endpoint
curl https://smartshop-api-xd40.onrender.com/api/test
```

### 7. Common Issues & Solutions

#### ❌ "Application failed to respond"
- Check logs in Render Dashboard
- Verify `DATABASE_URL` is set correctly
- Ensure all required env vars are present

#### ❌ "CORS error" from frontend
- Add your frontend URL to `CORS_ORIGINS`
- Format: `https://app.vercel.app,https://www.domain.com` (no spaces)

#### ❌ "Database connection failed"
- Use **Internal Database URL** if PostgreSQL is on Render
- Check database is running and accessible
- Verify connection string format

#### ❌ "Service suspends after inactivity"
- Free tier sleeps after 15 min inactivity
- Upgrade to paid plan or use a simple ping service
- First request after sleep takes ~30 seconds

### 8. Update Frontend Configuration

After backend is deployed, update frontend `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://smartshop-api-xd40.onrender.com
```

For local development, use `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 9. Monitoring

- **Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Dashboard shows CPU, Memory, Bandwidth
- **Events**: See deployment history and status

## 📝 Next Steps

1. ✅ Commit and push the fixed package.json
2. 🔄 Render will auto-deploy (if enabled)
3. 🔍 Check logs for successful startup
4. 🧪 Test API endpoints
5. 🌐 Update frontend to use production API
6. 🔐 Set up custom domain (optional)

## 🔗 Useful Links

- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Render PostgreSQL](https://render.com/docs/databases)
- [Environment Variables](https://render.com/docs/environment-variables)
