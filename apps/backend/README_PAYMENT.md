# Fake Payment Provider - Demo Implementation

⚠️ **WARNING: This is a FAKE payment gateway for demo/portfolio purposes only.**

**NEVER use this in production. NEVER store real card data.**

This implementation simulates realistic payment flows for demonstration purposes only. It behaves like a real payment gateway with proper status transitions, webhooks, and idempotency, but processes no real money.

## Features

- ✅ Multiple payment methods: Card, UPI, Wallet
- ✅ Realistic payment flows with async status updates
- ✅ Webhook simulation for payment status changes
- ✅ Idempotency support to prevent duplicate charges
- ✅ Provider-specific UX (card forms, UPI deep links, wallet redirects)
- ✅ Deterministic testing controls (force success/failure/pending)
- ✅ Order integration (updates order payment status)
- ✅ Refund and cancellation support

## Setup

### 1. Run Database Migration

```bash
cd apps/backend
npx prisma migrate dev --name add_payment_model
npx prisma generate
```

### 2. Start Backend Server

```bash
npm start
# Server runs on http://localhost:5555
```

## API Endpoints

### Create Payment

Creates a new payment intent for an order.

**Endpoint:** `POST /api/payments/create`

**Headers:**
- `Idempotency-Key` (optional): Prevents duplicate payment creation

**Request Body:**
```json
{
  "orderId": "123",
  "amount": 50000,
  "currency": "INR",
  "method": "card",
  "metadata": {
    "customerName": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "paymentId": "uuid-here",
    "providerId": "fake_card_abc123",
    "status": "pending",
    "clientSecret": "fake_card_abc123_secret_xyz",
    "metadata": {
      "message": "Use card_token_demo_4242 for success..."
    }
  }
}
```

### Confirm Payment

Confirms/captures a pending payment.

**Endpoint:** `POST /api/payments/confirm`

**Request Body:**
```json
{
  "providerId": "fake_card_abc123",
  "confirmToken": "card_token_demo_4242"
}
```

**Response:**
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

### Webhook (Simulate Provider Event)

Simulates a webhook event from the payment provider.

**Endpoint:** `POST /api/payments/webhook`

**Request Body:**
```json
{
  "providerId": "fake_upi_xyz789",
  "event": "payment_succeeded",
  "data": {
    "transactionId": "TXN123456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated to succeeded"
}
```

### Get Payment Status

Retrieves current payment status.

**Endpoint:** `GET /api/payments/status/:providerId`

**Response:**
```json
{
  "success": true,
  "payment": {
    "providerId": "fake_card_abc123",
    "status": "succeeded",
    "amount": 50000,
    "currency": "INR",
    "method": "card",
    "createdAt": "2025-11-09T...",
    "updatedAt": "2025-11-09T...",
    "confirmedAt": "2025-11-09T..."
  }
}
```

### Get Payments by Order

Retrieves all payment attempts for an order.

**Endpoint:** `GET /api/payments/order/:orderId`

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "uuid",
      "providerId": "fake_card_abc123",
      "status": "succeeded",
      ...
    }
  ]
}
```

### Cancel Payment

Cancels a pending payment.

**Endpoint:** `POST /api/payments/cancel`

**Request Body:**
```json
{
  "providerId": "fake_card_abc123"
}
```

### Refund Payment

Refunds a succeeded payment.

**Endpoint:** `POST /api/payments/refund`

**Request Body:**
```json
{
  "providerId": "fake_card_abc123",
  "amount": 25000
}
```

## Testing Controls

### Force Payment Outcomes

You can force specific payment outcomes using these techniques:

#### 1. Using Special Amounts

- **Amount = 998 paise**: Creates providerId with "fail" → payment will fail
- **Amount = 997 paise**: Creates providerId with "pending" → stays pending
- **Amount = 999 paise**: Simulates network timeout (5s delay then fails)

#### 2. Using Confirm Tokens

**Card Payments:**
- `card_token_demo_4242` or `card_token_success` → Succeeds
- Any other token → Fails

**UPI Payments:**
- `demo@upi` or any token with "success" → Succeeds
- Auto-transitions to success after 2 seconds (unless "pending" in providerId)

**Wallet Payments:**
- `demo_wallet_01` or any token with "demo" → Succeeds
- Auto-transitions to success after 2 seconds (unless "pending" in providerId)

#### 3. Using Provider ID Patterns

The system generates `providerId` based on method and amount:
- Normal: `fake_card_abc123`
- With "fail": `fake_card_fail_abc123` → Will always fail on confirm
- With "pending": `fake_card_pending_abc123` → Stays pending, needs webhook

### Example Test Scenarios

#### Test 1: Successful Card Payment

```bash
# Create payment
curl -X POST http://localhost:5555/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "123",
    "amount": 50000,
    "method": "card"
  }'

# Response includes clientSecret and providerId

# Confirm payment
curl -X POST http://localhost:5555/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "fake_card_abc123",
    "confirmToken": "card_token_demo_4242"
  }'

# Response: status = "succeeded"
```

#### Test 2: Failed Payment (using special amount)

```bash
curl -X POST http://localhost:5555/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "124",
    "amount": 998,
    "method": "card"
  }'

# providerId will contain "fail"

curl -X POST http://localhost:5555/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "fake_card_fail_xyz",
    "confirmToken": "any_token"
  }'

# Response: status = "failed"
```

#### Test 3: UPI Payment with Webhook

```bash
# Create UPI payment
curl -X POST http://localhost:5555/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "125",
    "amount": 75000,
    "method": "upi"
  }'

# Response includes upiDeepLink and providerId

# Simulate user completing payment in UPI app (webhook)
curl -X POST http://localhost:5555/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "fake_upi_xyz789",
    "event": "payment_succeeded"
  }'

# Check status
curl http://localhost:5555/api/payments/status/fake_upi_xyz789
```

#### Test 4: Pending Payment (stays pending)

```bash
# Create payment with pending amount
curl -X POST http://localhost:5555/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "126",
    "amount": 997,
    "method": "wallet"
  }'

# providerId will contain "pending"

# Try to confirm - will stay pending
curl -X POST http://localhost:5555/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "fake_wallet_pending_abc",
    "confirmToken": "demo_wallet_01"
  }'

# Response: status = "pending"

# Must use webhook to complete
curl -X POST http://localhost:5555/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "fake_wallet_pending_abc",
    "event": "payment_succeeded"
  }'
```

#### Test 5: Idempotency

```bash
# Create payment with idempotency key
curl -X POST http://localhost:5555/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-123" \
  -d '{
    "orderId": "127",
    "amount": 60000,
    "method": "card"
  }'

# Try again with same key - returns existing payment
curl -X POST http://localhost:5555/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-123" \
  -d '{
    "orderId": "999",
    "amount": 99999,
    "method": "wallet"
  }'

# Response: same payment as first request (orderId=127, amount=60000)
```

## Payment Methods

### 1. Card Payments

**Flow:**
1. Create payment → receive `clientSecret`
2. Frontend collects card details (fake token only)
3. Submit confirm with `card_token_demo_4242`
4. Payment succeeds immediately

**Test Tokens:**
- Success: `card_token_demo_4242`, `card_token_success`
- Failure: Any other token

### 2. UPI Payments

**Flow:**
1. Create payment → receive `upiDeepLink` and QR code
2. User "opens UPI app" (simulated)
3. Either:
   - Auto-transitions after 2s (if not "pending")
   - Or send webhook to complete
4. Frontend polls status

**Test IDs:**
- Success: `demo@upi`
- Auto-succeeds after 2 seconds

### 3. Wallet Payments (GooglePay/PhonePe style)

**Flow:**
1. Create payment → receive `deeplink`
2. User redirected to wallet app (simulated)
3. Either:
   - Auto-transitions after 2s (if not "pending")
   - Or send webhook to complete
4. Frontend polls status

**Test IDs:**
- Success: `demo_wallet_01`
- Auto-succeeds after 2 seconds

## Frontend Integration

See `PaymentModal.tsx` component for demo implementation showing:
- Payment method selection (Card/UPI/Wallet)
- Card form with fake inputs
- UPI deep link and QR code display
- Wallet redirect simulation
- Status polling for async methods
- Test controls (force success/fail buttons)

## Security Notes

⚠️ **CRITICAL SECURITY REMINDERS:**

1. **This is FAKE**: No real payment processing occurs
2. **No real card data**: Never accept or store real PANs, CVVs, etc.
3. **Demo only**: Clearly label as demo in all UIs
4. **Not PCI compliant**: This cannot handle real payment data
5. **Testing only**: Use only for portfolio/demo purposes

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (PaymentModal.tsx)                                │
│  - Select method                                             │
│  - Submit payment details                                    │
│  - Poll status                                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  Express Routes (/api/payments/*)                           │
│  - Validate requests                                         │
│  - Call service layer                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  Payment Service (paymentService.ts)                        │
│  - Business logic                                            │
│  - Idempotency                                               │
│  - DB persistence                                            │
│  - Order linking                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ↓                         ↓
┌────────────────┐       ┌────────────────┐
│ Provider Router│       │ Prisma Client  │
│ (factory)      │       │ (database)     │
└────────┬───────┘       └────────────────┘
         │
         ↓
┌────────────────┐
│ Fake Gateway   │
│ - Simulates    │
│   provider API │
│ - Test controls│
└────────────────┘
```

## Future Enhancements

To add real payment providers:

1. Implement `PaymentProvider` interface for Stripe/Razorpay
2. Update `providerRouter.ts` to return real provider
3. Store provider keys in environment variables
4. Add proper webhook signature validation
5. Implement proper error handling for real APIs

Example:
```typescript
// src/lib/payments/stripeProvider.ts
export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';
  
  async createPayment(request: CreatePaymentRequest) {
    // Call Stripe API
  }
  // ... implement other methods
}
```

## Troubleshooting

### Payment stuck in pending
- Check if providerId contains "pending"
- Send webhook event to transition status
- Or wait 2 seconds for auto-transition (UPI/Wallet only)

### Payment fails unexpectedly
- Check if providerId contains "fail"
- Check confirmToken (must be valid test token)
- Check amount (999 causes timeout)

### Idempotency not working
- Ensure same `Idempotency-Key` header on retry
- Check database for existing payment with that key

### Order not updating
- Check order ID is valid integer
- Check Order model exists in database
- Check paymentService logs for order update errors

## License

This is a demo implementation. Feel free to use for learning/portfolio purposes.

**Remember: NEVER use fake payment systems in production!**
