# API Refactoring Architecture

## Before Refactoring
```
Multiple Files with Hardcoded/Duplicated URLs
│
├── lib/axios.ts
│   └── const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
│
├── lib/api.ts
│   └── const API_URL = process.env.NEXT_PUBLIC_API_URL (NO FALLBACK!)
│
├── pages/api/verify-password.ts
│   └── const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
│
├── pages/api/update-password.ts
│   └── const backendURL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000"
│
└── services/*.ts
    └── Uses axios instance (inconsistent setup)

❌ Problems:
- Duplicated fallback logic (3 places)
- Inconsistent URL formatting
- lib/api.ts has no fallback (breaks in some cases)
- Spreading logic across multiple files
- Hard to maintain and update
```

---

## After Refactoring
```
Centralized Configuration
│
└── lib/config.ts (SINGLE SOURCE OF TRUTH)
    ├── export const getApiBaseUrl()
    │   └── Returns: process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000"
    │
    ├── export const API_BASE_URL
    │   └── Returns: "https://smartshop-api-xd40.onrender.com"
    │
    ├── export const API_URL
    │   └── Returns: "https://smartshop-api-xd40.onrender.com/api"
    │
    └── export const getEndpoint(endpoint)
        └── Returns: "https://smartshop-api-xd40.onrender.com/api/{endpoint}"

↓ Imports from 6 Files ↓

├── lib/axios.ts
│   └── import { API_URL } from "./config"
│
├── lib/api.ts
│   └── import { API_URL } from "./config"
│
├── pages/api/verify-password.ts
│   └── import { API_BASE_URL } from "@/lib/config"
│
├── pages/api/update-password.ts
│   └── import { API_BASE_URL } from "@/lib/config"
│
├── services/productService.ts
│   └── Uses axios instance (auto-benefits)
│
└── services/orderService.ts
    └── Uses axios instance (auto-benefits)

✅ Benefits:
- Single source of truth
- No duplicated logic
- Consistent URL handling
- Automatic fallback for all
- Easy to maintain
- Simple to update
- Scalable for new endpoints
```

---

## Data Flow Diagram

### Development with Local Backend
```
.env.local
    └── NEXT_PUBLIC_API_URL=http://localhost:5000
            ↓
        lib/config.ts
            ├── getApiBaseUrl() → "http://localhost:5000"
            ├── API_BASE_URL → "http://localhost:5000"
            └── API_URL → "http://localhost:5000/api"
            ↓
        All API Calls
            └── Requests → http://localhost:5000/api/...
```

### Production on Vercel
```
Vercel Environment Variables
    └── NEXT_PUBLIC_API_URL=https://smartshop-api-xd40.onrender.com
            ↓
        lib/config.ts
            ├── getApiBaseUrl() → "https://smartshop-api-xd40.onrender.com"
            ├── API_BASE_URL → "https://smartshop-api-xd40.onrender.com"
            └── API_URL → "https://smartshop-api-xd40.onrender.com/api"
            ↓
        All API Calls
            └── Requests → https://smartshop-api-xd40.onrender.com/api/...
```

### Missing Environment Variable (Fallback)
```
No Environment Variable Set
    └── (Empty)
            ↓
        lib/config.ts
            ├── getApiBaseUrl() → "http://localhost:5000" (FALLBACK)
            ├── API_BASE_URL → "http://localhost:5000"
            └── API_URL → "http://localhost:5000/api"
            ↓
        All API Calls
            └── Requests → http://localhost:5000/api/...
```

---

## File Dependency Graph

### Config Dependencies
```
lib/config.ts
├── Standalone (no dependencies)
└── Uses: process.env.NEXT_PUBLIC_API_URL
```

### Dependent Files
```
lib/config.ts
├── ← lib/axios.ts
├── ← lib/api.ts
├── ← pages/api/verify-password.ts
├── ← pages/api/update-password.ts
├── ← services/productService.ts (indirect via axios)
└── ← services/orderService.ts (indirect via axios)
```

---

## API Endpoint Coverage

### fetch() API Calls (11 endpoints from lib/api.ts)
```
config.ts → API_URL
├── GET    /products
├── GET    /products/category/{category}
├── GET    /products/brand/{brand}
├── GET    /products/{id}
├── GET    /user/profile
├── PUT    /user/profile
├── GET    /user/login-history
├── POST   /auth/forgot-password
├── POST   /auth/reset-password
├── POST   /auth/verify-code
└── POST   /auth/reset-password-with-code
```

### Axios API Calls (6+ endpoints from services)
```
config.ts → API_URL (via axios instance)
├── GET    /products
├── GET    /products/{id}
├── GET    /products/category/{category}
├── POST   /orders
├── GET    /orders/user/{userId}
└── GET    /orders/{orderId}
```

### API Routes (2 endpoints)
```
config.ts → API_BASE_URL
├── POST   /api/verify-password
└── POST   /api/update-password
```

**Total Coverage: 25+ API endpoints**

---

## Component Interaction

```
User Request
│
├─ Next.js App
│  ├─ Components/Pages
│  │  ├─ import { useCart } from context
│  │  ├─ import { addToWishlist } from context
│  │  └─ Trigger API calls
│  │     │
│  │     └─ Calls API functions
│  │        │
│  │        └─ lib/api.ts
│  │           ├── fetch(`${API_URL}/products`)
│  │           └── fetch(`${API_URL}/orders`)
│  │
│  ├─ Services
│  │  ├─ import api from "lib/axios"
│  │  └─ api.get(`/products`)
│  │     │
│  │     └─ lib/axios.ts
│  │        └── axios.create({ baseURL: API_URL })
│  │
│  └─ API Routes
│     ├─ pages/api/verify-password.ts
│     ├─ pages/api/update-password.ts
│     └─ axios.post(`${API_BASE_URL}/api/...`)
│
└─ lib/config.ts (CENTRAL CONFIG)
   ├── Reads: process.env.NEXT_PUBLIC_API_URL
   ├── Provides: API_BASE_URL & API_URL
   └── Used by: All above components
```

---

## Configuration Decision Tree

```
When any component/service makes an API call:

1. Import required function/constant:
   - For axios calls: import api from "@/lib/axios"
   - For fetch calls: import { API_URL } from "@/lib/config"
   - For custom URLs: import { API_BASE_URL } from "@/lib/config"

2. Make the request:
   - axios: api.get("/endpoint")
   - fetch: fetch(`${API_URL}/endpoint`)
   - custom: `${API_BASE_URL}/api/endpoint`

3. Config.ts handles:
   │
   ├─ Environment variable check
   │  ├─ NEXT_PUBLIC_API_URL exists?
   │  ├─ YES → Use it (trim slashes)
   │  └─ NO  → Use "http://localhost:5000"
   │
   ├─ Trailing slash removal
   │  └─ "https://api.com/" → "https://api.com"
   │
   └─ Export to all files
      ├─ API_BASE_URL
      ├─ API_URL
      └─ getEndpoint()
```

---

## Timeline of Refactoring

```
Before
─────────────────────────────────────────────
Scattered environment checks:
  • lib/axios.ts - has fallback
  • lib/api.ts - NO fallback
  • pages/api/verify-password.ts - has fallback
  • pages/api/update-password.ts - has fallback + trim
  
Result: Inconsistent, hard to maintain, duplicated logic

After
─────────────────────────────────────────────
Centralized configuration:
  • lib/config.ts - single source with all logic
  • All files import from config
  • Consistent everywhere
  • Easy to update (1 file)
  • Future-proof for new endpoints
```

---

## Summary Table

| Aspect | Before | After |
|--------|--------|-------|
| **Config Location** | 4 different files | 1 file (config.ts) |
| **Fallback Logic** | Duplicated 3x, missing in 1 | Centralized, applied everywhere |
| **Trailing Slash** | Inconsistent handling | Automatic in config |
| **New Endpoints** | Update multiple files | Just use API_URL |
| **Environment Setup** | Guide spread across docs | Single .env.example |
| **Maintenance** | Edit 4+ files | Edit 1 file |
| **Debugging** | Check multiple places | Check config.ts first |
| **Testing** | Change URL in multiple places | Change 1 env var |
| **Documentation** | Scattered notes | API_CONFIG_GUIDE.md |
| **Type Safety** | Loosely typed | Properly exported constants |

---

This refactoring ensures:
✅ **Maintainability** - Single source of truth
✅ **Reliability** - Consistent fallback behavior
✅ **Scalability** - Easy to add new endpoints
✅ **Production Ready** - Works with environment variables
✅ **Developer Experience** - Clear patterns and documentation
