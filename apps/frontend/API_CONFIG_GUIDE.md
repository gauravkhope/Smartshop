# API Configuration Refactoring Guide

## Summary

This project has been refactored to support both local development and production deployments through a centralized API configuration system. All hardcoded API URLs have been replaced with environment-based configuration.

## Key Changes

### 1. **New Configuration File** (`lib/config.ts`)
A centralized configuration file that exports:
- `getApiBaseUrl()` - Function to get the API base URL with proper fallback
- `API_BASE_URL` - The base URL (e.g., `https://api.example.com`)
- `API_URL` - The full API endpoint (e.g., `https://api.example.com/api`)
- `getEndpoint(endpoint)` - Helper function to construct full endpoint URLs

```typescript
// Usage
import { API_URL, API_BASE_URL, getEndpoint } from "@/lib/config";

// These all work:
const endpoint1 = API_URL;                    // https://api.example.com/api
const endpoint2 = getEndpoint("products");    // https://api.example.com/api/products
const endpoint3 = API_BASE_URL;               // https://api.example.com
```

### 2. **Updated Files**

#### `lib/axios.ts`
- Imports `API_URL` from config
- Simplifies axios instance creation
- **Before**: Duplicated environment logic
- **After**: Uses centralized config

#### `lib/api.ts`
- Imports `API_URL` from config
- All fetch calls now use the configured URL
- No more hardcoded `http://localhost:5000`

#### `pages/api/verify-password.ts`
- Imports `API_BASE_URL` from config
- Removes inline environment variable checks
- Consistent URL handling

#### `pages/api/update-password.ts`
- Imports `API_BASE_URL` from config
- Removes inline environment variable checks
- Cleaner code

#### `services/productService.ts`
- Already uses axios instance (no changes needed)
- Automatically benefits from config

#### `services/orderService.ts`
- Already uses axios instance (no changes needed)
- Automatically benefits from config

## Environment Variables

### Local Development
Create `.env.local` in `apps/frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Vercel Production
Set environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

Or in `vercel.json`:
```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-render-backend.onrender.com"
  }
}
```

### Environment Variable Auto-fallback
If `NEXT_PUBLIC_API_URL` is not set, defaults to:
```
http://localhost:5000
```

## How It Works

### Configuration Flow
```
1. Environment Variable Check
   ↓
   process.env.NEXT_PUBLIC_API_URL exists?
   ├─ YES → Use it (trim trailing slashes)
   └─ NO  → Use fallback "http://localhost:5000"
   ↓
2. Store in centralized config
   ↓
3. All API calls use config values
```

### Example Flow
```typescript
// In config.ts
export const API_BASE_URL = getApiBaseUrl();
// Returns: "https://api.example.com" or "http://localhost:5000"

export const API_URL = `${API_BASE_URL}/api`;
// Returns: "https://api.example.com/api" or "http://localhost:5000/api"

// In your API calls
const response = await fetch(`${API_URL}/products`, {...});
// Automatically uses the configured URL
```

## Testing

### Local Development
1. Ensure backend runs on `http://localhost:5000`
2. Set `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
3. Run frontend:
   ```bash
   cd apps/frontend
   npm run dev
   ```

### Production/Vercel
1. Set environment variable in Vercel dashboard
2. Deploy - API automatically uses production URL
3. Verify in browser console:
   ```javascript
   // Check what URL is being used
   console.log(fetch.toString()); // Will show production URL
   ```

## Migration Checklist

- [x] Create centralized config file (`lib/config.ts`)
- [x] Update axios instance (`lib/axios.ts`)
- [x] Update fetch API (`lib/api.ts`)
- [x] Update password verification API route (`pages/api/verify-password.ts`)
- [x] Update password update API route (`pages/api/update-password.ts`)
- [x] Create `.env.example` with documentation
- [x] All service files use axios instance (automatic)
- [ ] Update your `.env.local` for development
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel dashboard for production

## Troubleshooting

### API calls not working in production?
1. Check `NEXT_PUBLIC_API_URL` is set in Vercel
2. Verify the URL is correct and accessible
3. Check CORS settings on your backend
4. Verify backend is running on production URL

### Getting "Cannot find module" error?
The config file should be imported with the alias `@/lib/config`:
```typescript
import { API_URL } from "@/lib/config";  // ✓ Correct
import { API_URL } from "./config";       // ✗ Wrong path
```

### URL has extra slashes or missing `/api`?
The config automatically:
- Removes trailing slashes from base URL
- Adds `/api` to create the full endpoint
- Handles both with and without trailing slashes

## Benefits

✅ **Single source of truth** - All API configuration in one place
✅ **Easy to update** - Change URL in one environment variable
✅ **Production ready** - Works seamlessly with Vercel deployments
✅ **Development friendly** - Automatic fallback for local development
✅ **No more refactoring** - Add new endpoints without URL concerns
✅ **Type-safe** - Helper functions provide clear API patterns

## Future Improvements

- Add retry logic to API base URL configuration
- Add timeout configuration
- Add headers configuration (Authorization, etc.)
- Add request interceptors for auth tokens
- Create API route groups for different endpoints
