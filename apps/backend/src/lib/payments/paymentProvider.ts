/**
 * Payment Provider Interface
 * 
 * This interface defines the contract that all payment providers must implement.
 * It allows for pluggable payment gateway integrations (Fake, Stripe, Razorpay, etc.)
 */

export type PaymentMethod = 'card' | 'upi' | 'wallet' | 'netbanking' | 'emi' | 'cod';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

export interface CreatePaymentRequest {
  orderId: string;
  amount: number; // Amount in smallest currency unit (paise for INR, cents for USD)
  currency?: string;
  method: PaymentMethod;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface CreatePaymentResponse {
  providerId: string;
  status: PaymentStatus;
  clientSecret?: string; // For card payments
  deeplink?: string; // For wallet payments
  upiDeepLink?: string; // For UPI payments
  qrCode?: string; // For UPI QR codes
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentRequest {
  providerId: string;
  confirmToken?: string; // Card token, UPI transaction ID, etc.
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentResponse {
  providerId: string;
  status: PaymentStatus;
  message: string;
  errorCode?: string;
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  providerId: string;
  event: 'payment_succeeded' | 'payment_failed' | 'payment_pending' | 'payment_refunded';
  data?: Record<string, any>;
  timestamp: Date;
}

export interface PaymentStatusResponse {
  providerId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  method: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * PaymentProvider Interface
 * 
 * All payment gateway implementations must implement this interface.
 */
export interface PaymentProvider {
  /**
   * Provider name (e.g., 'fake_gateway', 'stripe', 'razorpay')
   */
  readonly name: string;

  /**
   * Create a new payment intent/order
   * 
   * @param request - Payment creation parameters
   * @returns Payment creation response with provider-specific data
   */
  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;

  /**
   * Confirm/capture a payment
   * 
   * @param request - Payment confirmation parameters
   * @returns Payment confirmation response with final status
   */
  confirmPayment(request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse>;

  /**
   * Get payment status
   * 
   * @param providerId - Provider-specific payment ID
   * @returns Current payment status and details
   */
  getPaymentStatus(providerId: string): Promise<PaymentStatusResponse | null>;

  /**
   * Handle webhook events from provider
   * 
   * @param event - Webhook event data
   * @returns Processing result
   */
  handleWebhook(event: WebhookEvent): Promise<{ success: boolean; message: string }>;

  /**
   * Refund a payment (optional for demo)
   * 
   * @param providerId - Provider-specific payment ID
   * @param amount - Amount to refund (optional, full refund if not specified)
   * @returns Refund status
   */
  refundPayment?(providerId: string, amount?: number): Promise<ConfirmPaymentResponse>;
}

/**
 * Payment creation options for internal use
 */
export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: string;
  providerId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: any;
  idempotencyKey?: string;
  clientSecret?: string;
  deeplink?: string;
  errorMessage?: string;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
