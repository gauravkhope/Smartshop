# ✅ Backend is LIVE! Now Set Up Database

## 🎉 Success Status:
- ✅ Backend deployed: https://smartshop-api-xd4o.onrender.com
- ✅ Health check: Working (200 OK)
- ✅ Test endpoint: Working (200 OK)
- ⚠️ Products endpoint: 500 error (database not configured)

---

## 🔧 Next Steps: Set Up Database

### Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click:** New + → PostgreSQL
3. **Fill in:**
   - Name: `smartshop-db` (or any name you like)
   - Database: `smartshop_production`
   - User: (auto-generated)
   - Region: Same as your web service
   - Plan: **Free** (or paid if you prefer)
4. **Click:** Create Database
5. **Wait:** 2-3 minutes for provisioning

---

### Step 2: Get Database URL

Once database is created:

1. **Click on your new database**
2. **Find:** "Internal Database URL" section
3. **Copy:** The full URL (looks like):
   ```
   postgresql://user:password@dpg-xxxxx-a/database_name
   ```
   ⚠️ **Use INTERNAL URL, not External!**

---

### Step 3: Add Database URL to Web Service

1. **Go to:** Your web service `smartshop-api-xd4o`
2. **Click:** Environment tab
3. **Add Environment Variable:**
   - Key: `DATABASE_URL`
   - Value: (paste the Internal Database URL from Step 2)
4. **Save**

---

### Step 4: Add Other Required Environment Variables

While in Environment tab, add these if missing:

**JWT_SECRET** (generate with this command):
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Email Settings:**
- `EMAIL_USER` = your-email@gmail.com
- `EMAIL_PASSWORD` = your Gmail app password
- `EMAIL_SERVICE` = gmail
- `SMTP_HOST` = smtp.gmail.com
- `SMTP_PORT` = 587

**Frontend/CORS:**
- `FRONTEND_URL` = http://localhost:3000 (or your production URL)
- `CORS_ORIGINS` = http://localhost:3000,http://localhost:3001

---

### Step 5: Redeploy

After adding DATABASE_URL:

1. **Click:** Manual Deploy (top right)
2. **Select:** Deploy latest commit
3. **Wait:** 2-3 minutes for deployment

---

### Step 6: Run Database Migrations

Once deployed successfully:

1. **Go to:** Your web service page
2. **Click:** Shell tab (top menu)
3. **Run these commands:**
   ```bash
   # Create database tables
   npx prisma migrate deploy
   
   # Seed initial data (optional)
   npx prisma db seed
   ```

If seed command fails (it might), you can skip it - the database will just be empty initially.

---

### Step 7: Test Everything

**In browser, visit:**
```
https://smartshop-api-xd4o.onrender.com/api/products
```

Should return:
```json
{
  "products": [],
  "totalPages": 1,
  "currentPage": 1
}
```
or your seeded products if seeding worked.

**In PowerShell:**
```powershell
Invoke-WebRequest -Uri "https://smartshop-api-xd4o.onrender.com/api/products" -UseBasicParsing
```

---

## 🎯 Frontend is Now Configured

Your frontend `.env.local` has been updated to:
```
NEXT_PUBLIC_API_URL=https://smartshop-api-xd4o.onrender.com
```

**Restart your frontend:**
```powershell
# Navigate to frontend folder
cd ecommerce-enterprise-project\apps\frontend

# Start dev server
npm run dev
```

Now your local frontend will connect to the live Render backend!

---

## 📊 Summary

### What's Working Now:
- ✅ Backend live on Render
- ✅ Health check endpoint
- ✅ Test endpoint
- ✅ Frontend configured with correct URL

### What You Need to Do:
1. [ ] Create PostgreSQL database on Render
2. [ ] Add DATABASE_URL to web service
3. [ ] Add other env variables (JWT_SECRET, EMAIL, etc.)
4. [ ] Redeploy
5. [ ] Run migrations in Shell
6. [ ] Test products endpoint
7. [ ] Restart frontend

---

## 🆘 If You Need Help

**Check Render logs after each step:**
- Dashboard → Your Service → Logs

**Common issues:**
- Database connection error → Wrong DATABASE_URL (use Internal, not External)
- Migration error → Make sure DATABASE_URL is correct
- 500 errors → Check logs for specific error message

---

## ✨ Once Complete

You'll have a fully working:
- 🌐 Live backend API on Render
- 💾 PostgreSQL database on Render
- 🖥️ Local frontend connecting to live backend
- 🎉 Full-stack application deployed!

**Your live API URL:** https://smartshop-api-xd4o.onrender.com
