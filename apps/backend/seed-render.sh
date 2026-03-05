#!/bin/bash
# Seed Render Database with 2000 Products

# Set your Render Internal Database URL here
RENDER_DB_URL="postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/smartshop_vgxd"

# You can also get it from: Render Dashboard → PostgreSQL → Connections → Internal Database URL

echo "🌱 Seeding Render Database with 2000 products..."
echo "Database: $RENDER_DB_URL"
echo ""

# Run Prisma seed with Render database URL
DATABASE_URL="$RENDER_DB_URL" npx prisma db seed

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully seeded 2000 products to Render!"
  echo "Check: https://smartshop-api-xd4o.onrender.com/api/products"
else
  echo ""
  echo "❌ Seeding failed. Make sure:"
  echo "1. DATABASE_URL is correct (use INTERNAL URL)"
  echo "2. PostgreSQL database is running"
  echo "3. Network access is allowed"
fi
