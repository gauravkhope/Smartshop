# Payment System - Quick Start Guide

## 🚀 Getting Started

### 1. Database Migration (DONE ✅)

The Payment model has been added to your database. The migration created:
- Payment table with all necessary fields
- Indexes for performance
- Foreign key relationships

### 2. Start Backend Server

```bash
cd apps/backend
npm start
```

Backend will run on `http://localhost:5555`

### 3. Test the API

Open a new terminal and try these commands:

#### Create a Card Payment
```bash
curl -X POST http://localhost:5555/api/payments/create \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"1\",
    \"amount\": 50000,
    \"method\": \"card\"
  }"
```

You'll get a response like:
```json
{
  "success": true,
  "payment": {
    "paymentId": "uuid-here",
    "providerId": "fake_card_abc123",
    "status": "pending",
    "clientSecret": "fake_card_abc123_secret_xyz"
  }
}
```

#### Confirm the Payment
```bash
curl -X POST http://localhost:5555/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d "{
    \"providerId\": \"fake_card_abc123\",
    \"confirmToken\": \"card_token_demo_4242\"
  }"
```

Response:
```json
{
  "success": true,
  "payment": {
    "providerId": "fake_card_abc123",
    "status": "succeeded",
    "message": "Payment succeeded"
  }
}
```

## 🎨 Frontend Integration

### Add PaymentModal to Your Checkout

```tsx
import PaymentModal from "@/components/PaymentModal";
import { useState } from "react";

export default function CheckoutPage() {
  const [showPayment, setShowPayment] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowPayment(true)}>
        Pay Now
      </button>
      
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        orderId="123"
        amount={50000} // Amount in paise (₹500.00)
        currency="INR"
        onSuccess={(paymentId) => {
          console.log("Payment succeeded:", paymentId);
          // Redirect to order confirmation
        }}
        onError={(error) => {
          console.error("Payment failed:", error);
        }}
      />
    </>
  );
}
```

### Update Your Checkout Flow

In `apps/frontend/app/checkout/page.tsx`, replace the "Place Order" button with payment modal:

```tsx
// Add at top
import { useState } from "react";
import PaymentModal from "@/components/PaymentModal";

// Inside component
const [showPaymentModal, setShowPaymentModal] = useState(false);

// Replace handlePlaceOrder with:
const handleInitiatePayment = () => {
  if (!validateForm()) return;
  setShowPaymentModal(true);
};

// Add PaymentModal
<PaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  orderId={orderId}
  amount={Math.round(getCartTotal() * 1.08)} // Total with tax in paise
  currency="INR"
  onSuccess={(paymentId) => {
    // Clear cart
    clearCart();
    // Redirect to order confirmation
    router.push(`/order-confirmation/${orderId}`);
  }}
  onError={(error) => {
    toast.error(error);
  }}
/>
```

## 🧪 Testing Scenarios

### Scenario 1: Successful Card Payment
1. Open payment modal
2. Select "Card"
3. Click "Continue to Pay"
4. Enter `card_token_demo_4242`
5. Click "Pay" → Success!

### Scenario 2: Failed Card Payment
1. Select "Card"
2. Enter `card_token_fail`
3. Click "Pay" → Fails with error message

### Scenario 3: UPI Payment
1. Select "UPI"
2. Click "Continue to Pay"
3. See QR code and deep link
4. Click "Simulate Success" → Payment succeeds!

### Scenario 4: Wallet Payment
1. Select "Wallet"
2. Click "Continue to Pay"
3. Click "Simulate Success" → Payment succeeds!

## 📊 Database Queries

Check payments in your database:

```sql
-- All payments
SELECT * FROM "Payment" ORDER BY "createdAt" DESC;

-- Successful payments
SELECT * FROM "Payment" WHERE status = 'succeeded';

-- Payments for a specific order
SELECT * FROM "Payment" WHERE "orderId" = '123';

-- Payment summary
SELECT 
  status, 
  COUNT(*) as count, 
  SUM(amount) as total_amount
FROM "Payment"
GROUP BY status;
```

## 🔍 Debugging

### Check Backend Logs
The backend logs all payment operations:
```
[PaymentService] Created payment: uuid (fake_card_abc123)
[PaymentService] Payment succeeded, order 123 marked as paid
[FakeGateway] Auto-transitioned fake_upi_xyz to succeeded
```

### Check Payment Status via API
```bash
curl http://localhost:5555/api/payments/status/fake_card_abc123
```

### Check Order Payments
```bash
curl http://localhost:5555/api/payments/order/123
```

## 🎯 Next Steps

1. **Integrate with Your Checkout:**
   - Add PaymentModal to checkout page
   - Link payment success to order confirmation
   - Update order payment status display

2. **Test Different Scenarios:**
   - Try all payment methods
   - Test failure cases
   - Test network timeout (amount = 999)
   - Test pending states (amount = 997)

3. **Customize UI:**
   - Style PaymentModal to match your theme
   - Add your branding
   - Customize success/error messages

4. **Production Planning:**
   - When ready for production, implement real provider (Stripe/Razorpay)
   - Update `providerRouter.ts` to use real provider
   - Add environment variables for API keys
   - Implement webhook signature validation

## ⚠️ Remember

**This is a FAKE payment system for demo purposes only.**
- Never use in production
- Never store real card data
- Always show clear demo warnings to users

## 📚 Resources

- Full documentation: `README_PAYMENT.md`
- API endpoints: See "API Endpoints" section in README_PAYMENT.md
- Test cases: `tests/payments/fakeGateway.test.ts`
- Payment provider interface: `src/lib/payments/paymentProvider.ts`

## 🆘 Troubleshooting

**Payment stuck in pending?**
- Check if providerId contains "pending"
- Send webhook: `POST /api/payments/webhook`
- Or wait 2s for auto-transition (UPI/Wallet)

**Payment fails immediately?**
- Check if providerId contains "fail"
- Check confirm token (must be valid test token)

**Frontend can't connect to backend?**
- Ensure backend is running on port 5555
- Check CORS settings in backend
- Check axios baseURL in frontend

**Database errors?**
- Run: `npx prisma generate`
- Check connection string in `.env`
- Verify migration was applied

---

**Happy Testing! 🎉**

For more details, see the full `README_PAYMENT.md` documentation.
