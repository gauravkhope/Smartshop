/**
 * Payment Service
 * 
 * Business logic layer for payment operations.
 * Handles idempotency, order linking, and database persistence.
 */

import prisma from '../lib/prisma';
import { 
  CreatePaymentRequest, 
  CreatePaymentResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  WebhookEvent,
  PaymentStatusResponse,
} from '../lib/payments/paymentProvider';
import { getDefaultProvider } from '../lib/payments/providerRouter';

/**
 * Create a new payment
 * Handles idempotency and database persistence
 */
export async function createPayment(
  request: CreatePaymentRequest,
  idempotencyKey?: string
): Promise<CreatePaymentResponse & { paymentId: string }> {
  // Check for idempotency key
  if (idempotencyKey) {
    const existingPayment = await prisma.payment.findUnique({
      where: { idempotencyKey },
    });
    
    if (existingPayment) {
      console.log(`[PaymentService] Idempotency key matched: ${idempotencyKey}`);
      
      return {
        paymentId: existingPayment.id,
        providerId: existingPayment.providerId,
        status: existingPayment.status as any,
        clientSecret: existingPayment.clientSecret || undefined,
        deeplink: existingPayment.deeplink || undefined,
        metadata: existingPayment.metadata as any,
      };
    }
  }
  
  // Create payment with provider
  const provider = getDefaultProvider();
  const providerResponse = await provider.createPayment(request);
  
  // Save to database
  const payment = await prisma.payment.create({
    data: {
      orderId: request.orderId,
      provider: provider.name,
      providerId: providerResponse.providerId,
      method: request.method,
      amount: request.amount,
      currency: request.currency || 'INR',
      status: providerResponse.status,
      metadata: providerResponse.metadata as any || {},
      idempotencyKey: idempotencyKey || null,
      clientSecret: providerResponse.clientSecret || null,
      deeplink: providerResponse.deeplink || providerResponse.upiDeepLink || null,
    },
  });
  
  console.log(`[PaymentService] Created payment: ${payment.id} (${payment.providerId})`);
  
  return {
    paymentId: payment.id,
    providerId: payment.providerId,
    status: payment.status as any,
    clientSecret: payment.clientSecret || undefined,
    deeplink: payment.deeplink || undefined,
    upiDeepLink: providerResponse.upiDeepLink,
    qrCode: providerResponse.qrCode,
    metadata: providerResponse.metadata,
  };
}

/**
 * Confirm a payment
 * Handles status transitions and order updates
 */
export async function confirmPayment(
  request: ConfirmPaymentRequest
): Promise<ConfirmPaymentResponse & { paymentId: string }> {
  // Get payment from database
  const payment = await prisma.payment.findUnique({
    where: { providerId: request.providerId },
  });
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  // Idempotency: If already in final state, return existing status
  if (payment.status === 'succeeded' || payment.status === 'failed' || payment.status === 'cancelled') {
    console.log(`[PaymentService] Payment already in final state: ${payment.status}`);
    
    return {
      paymentId: payment.id,
      providerId: payment.providerId,
      status: payment.status as any,
      message: `Payment already ${payment.status}`,
    };
  }
  
  // Confirm with provider
  const provider = getDefaultProvider();
  const providerResponse = await provider.confirmPayment(request);
  
  // Update database
  const updatedPayment = await prisma.payment.update({
    where: { providerId: request.providerId },
    data: {
      status: providerResponse.status,
      confirmedAt: providerResponse.status === 'succeeded' ? new Date() : null,
      errorMessage: providerResponse.errorCode || providerResponse.message || null,
    },
  });
  
  // Update order payment status if payment succeeded
  if (providerResponse.status === 'succeeded') {
    await updateOrderPaymentStatus(payment.orderId, 'paid');
    console.log(`[PaymentService] Payment succeeded, order ${payment.orderId} marked as paid`);
  } else if (providerResponse.status === 'failed') {
    await updateOrderPaymentStatus(payment.orderId, 'failed');
    console.log(`[PaymentService] Payment failed for order ${payment.orderId}`);
  }
  
  return {
    paymentId: updatedPayment.id,
    providerId: updatedPayment.providerId,
    status: updatedPayment.status as any,
    message: providerResponse.message,
    errorCode: providerResponse.errorCode,
  };
}

/**
 * Get payment status
 */
export async function getPaymentStatus(providerId: string): Promise<PaymentStatusResponse | null> {
  const payment = await prisma.payment.findUnique({
    where: { providerId },
  });
  
  if (!payment) {
    return null;
  }
  
  return {
    providerId: payment.providerId,
    status: payment.status as any,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method as any,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    confirmedAt: payment.confirmedAt || undefined,
    errorMessage: payment.errorMessage || undefined,
    metadata: payment.metadata as any,
  };
}

/**
 * Handle webhook event
 */
export async function handleWebhook(event: WebhookEvent): Promise<{ success: boolean; message: string }> {
  // Verify payment exists in database
  const payment = await prisma.payment.findUnique({
    where: { providerId: event.providerId },
  });
  
  if (!payment) {
    return {
      success: false,
      message: 'Payment not found',
    };
  }
  
  // Process with provider
  const provider = getDefaultProvider();
  const result = await provider.handleWebhook(event);
  
  if (!result.success) {
    return result;
  }
  
  // Update database based on event
  let newStatus = payment.status;
  
  switch (event.event) {
    case 'payment_succeeded':
      newStatus = 'succeeded';
      break;
    case 'payment_failed':
      newStatus = 'failed';
      break;
    case 'payment_refunded':
      newStatus = 'refunded';
      break;
    case 'payment_pending':
      newStatus = 'pending';
      break;
  }
  
  // Update payment in database
  const updatedPayment = await prisma.payment.update({
    where: { providerId: event.providerId },
    data: {
      status: newStatus,
      confirmedAt: newStatus === 'succeeded' ? new Date() : payment.confirmedAt,
    },
  });
  
  // Update order if payment succeeded
  if (newStatus === 'succeeded') {
    await updateOrderPaymentStatus(payment.orderId, 'paid');
    console.log(`[PaymentService] Webhook: Payment succeeded for order ${payment.orderId}`);
  } else if (newStatus === 'failed') {
    await updateOrderPaymentStatus(payment.orderId, 'failed');
    console.log(`[PaymentService] Webhook: Payment failed for order ${payment.orderId}`);
  }
  
  return {
    success: true,
    message: `Payment status updated to ${newStatus}`,
  };
}

/**
 * Get payment by order ID
 */
export async function getPaymentByOrderId(orderId: string) {
  return await prisma.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all payments for an order (in case of retries)
 */
export async function getPaymentsByOrderId(orderId: string) {
  return await prisma.payment.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update order payment status
 * TODO: Update this based on your Order model structure
 */
async function updateOrderPaymentStatus(orderId: string, status: 'paid' | 'failed' | 'pending'): Promise<void> {
  try {
    // Parse orderId (might be string or number)
    const orderIdNum = parseInt(orderId);
    
    if (isNaN(orderIdNum)) {
      console.warn(`[PaymentService] Invalid orderId: ${orderId}`);
      return;
    }
    
    // Update order payment status
    await prisma.order.update({
      where: { id: orderIdNum },
      data: { 
        paymentStatus: status,
        orderStatus: status === 'paid' ? 'confirmed' : 'pending',
      },
    });
  } catch (error) {
    console.error(`[PaymentService] Error updating order ${orderId}:`, error);
    // Don't throw - payment succeeded even if order update fails
  }
}

/**
 * Cancel a payment
 */
export async function cancelPayment(providerId: string): Promise<ConfirmPaymentResponse> {
  const payment = await prisma.payment.findUnique({
    where: { providerId },
  });
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  if (payment.status !== 'pending') {
    throw new Error(`Cannot cancel payment with status: ${payment.status}`);
  }
  
  // Update payment status
  await prisma.payment.update({
    where: { providerId },
    data: { 
      status: 'cancelled',
      errorMessage: 'Cancelled by user',
    },
  });
  
  return {
    providerId,
    status: 'cancelled',
    message: 'Payment cancelled successfully',
  };
}

/**
 * Refund a payment (demo implementation)
 */
export async function refundPayment(providerId: string, amount?: number): Promise<ConfirmPaymentResponse> {
  const payment = await prisma.payment.findUnique({
    where: { providerId },
  });
  
  if (!payment) {
    throw new Error('Payment not found');
  }
  
  if (payment.status !== 'succeeded') {
    throw new Error(`Cannot refund payment with status: ${payment.status}`);
  }
  
  // Update payment status
  await prisma.payment.update({
    where: { providerId },
    data: { 
      status: 'refunded',
      metadata: {
        ...(payment.metadata as any || {}),
        refundAmount: amount || payment.amount,
        refundedAt: new Date().toISOString(),
      },
    },
  });
  
  return {
    providerId,
    status: 'refunded',
    message: 'Payment refunded successfully',
  };
}



/**
 * Fake UPI Payment Validator
 * --------------------------------------------
 * Simulates UPI success/failure for demo/testing.
 * Only 36 UPI IDs succeed; all others fail.
 */
export function handleFakeUpiPayment(upiId: string) {
  const validUpiIds = [
    "demo@upi", "pay@okaxis", "demo@ybl", "paytm@okicici", "test@okhdfcbank",
    "amazon@apl", "flipkart@ybl", "phonepe@upi", "gpay@okaxis", "icici@okicici",
    "axis@okaxis", "sbi@oksbi", "hdfc@okhdfcbank", "kotak@okicici", "bob@okbob",
    "citi@okciti", "hsbc@okhdfc", "pnb@okpnb", "upi@okicici", "merchant@ybl",
    "shop@okaxis", "book@okhdfcbank", "mobikwik@upi", "fastpay@okicici", "order@okaxis",
    "snapdeal@ybl", "recharge@okhdfcbank", "express@okaxis", "quickpay@upi",
    "reliance@okicici", "bigbazaar@ybl", "zomato@upi", "swiggy@okhdfcbank",
    "flip@ybl", "store@okaxis", "demo@icicibank", "bazaar@upi"
  ];

  const id = upiId?.trim().toLowerCase();
  const success = validUpiIds.includes(id);

  return {
    status: success ? "success" : "failed",
    message: success
      ? "✅ Payment Successful (Demo)"
      : "❌ Payment Failed - Invalid UPI ID",
  };
}
