/**
 * Payment Routes
 * 
 * Express routes for payment operations:
 * - POST /api/payments/create - Create a new payment
 * - POST /api/payments/confirm - Confirm a payment
 * - POST /api/payments/webhook - Handle provider webhooks
 * - GET /api/payments/status/:providerId - Get payment status
 * - GET /api/payments/order/:orderId - Get payments for an order
 * - POST /api/payments/cancel - Cancel a pending payment
 * - POST /api/payments/refund - Refund a payment
 */

import { Router, Request, Response } from 'express';
import { 
  createPayment, 
  confirmPayment, 
  getPaymentStatus,
  handleWebhook,
  getPaymentByOrderId,
  getPaymentsByOrderId,
  cancelPayment,
  refundPayment,
  handleFakeUpiPayment,
} from '../services/paymentService';
import { CreatePaymentRequest, ConfirmPaymentRequest, WebhookEvent } from '../lib/payments/paymentProvider';

const router = Router();

/**
 * POST /api/payments/create
 * Create a new payment intent
 * 
 * Headers:
 *   Idempotency-Key (optional) - Prevents duplicate payment creation
 * 
 * Body:
 *   {
 *     orderId: string,
 *     amount: number,
 *     currency?: string,
 *     method: 'card' | 'upi' | 'wallet',
 *     metadata?: object
 *   }
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const request: CreatePaymentRequest = req.body;
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
    
    // Validation
    if (!request.orderId || !request.amount || !request.method) {
      return res.status(400).json({
        error: 'Missing required fields: orderId, amount, method',
      });
    }
    
    if (!['card', 'upi', 'wallet', 'netbanking', 'emi', 'cod'].includes(request.method)) {
      return res.status(400).json({
        error: 'Invalid payment method. Must be: card, upi, wallet, netbanking, emi, or cod',
      });
    }
    
    if (request.amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0',
      });
    }
    
    console.log(`[PaymentRoutes] Creating payment for order ${request.orderId}, method: ${request.method}, amount: ${request.amount}`);
    
    const result = await createPayment(request, idempotencyKey);
    
    res.status(201).json({
      success: true,
      payment: result,
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Error creating payment:', error);
    res.status(500).json({
      error: 'Failed to create payment',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/confirm
 * Confirm/capture a payment
 * 
 * Body:
 *   {
 *     providerId: string,
 *     confirmToken?: string
 *   }
 */
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const request: ConfirmPaymentRequest = req.body;
    
    if (!request.providerId) {
      return res.status(400).json({
        error: 'Missing required field: providerId',
      });
    }
    
    console.log(`[PaymentRoutes] Confirming payment ${request.providerId}`);
    
    const result = await confirmPayment(request);
    
    res.status(200).json({
      success: true,
      payment: result,
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Error confirming payment:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/webhook
 * Handle webhook events from payment provider
 * 
 * Body:
 *   {
 *     providerId: string,
 *     event: 'payment_succeeded' | 'payment_failed' | 'payment_pending' | 'payment_refunded',
 *     data?: object
 *   }
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event: WebhookEvent = {
      providerId: req.body.providerId,
      event: req.body.event,
      data: req.body.data,
      timestamp: new Date(),
    };
    
    if (!event.providerId || !event.event) {
      return res.status(400).json({
        error: 'Missing required fields: providerId, event',
      });
    }
    
    console.log(`[PaymentRoutes] Webhook received: ${event.event} for ${event.providerId}`);
    
    const result = await handleWebhook(event);
    
    res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Error handling webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error.message,
    });
  }
});

/**
 * GET /api/payments/status/:providerId
 * Get payment status
 */
router.get('/status/:providerId', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    
    console.log(`[PaymentRoutes] Getting status for ${providerId}`);
    
    const status = await getPaymentStatus(providerId);
    
    if (!status) {
      return res.status(404).json({
        error: 'Payment not found',
      });
    }
    
    res.status(200).json({
      success: true,
      payment: status,
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Error getting payment status:', error);
    res.status(500).json({
      error: 'Failed to get payment status',
      message: error.message,
    });
  }
});

/**
 * GET /api/payments/order/:orderId
 * Get all payments for an order
 */
router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    console.log(`[PaymentRoutes] Getting payments for order ${orderId}`);
    
    const payments = await getPaymentsByOrderId(orderId);
    
    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Error getting order payments:', error);
    res.status(500).json({
      error: 'Failed to get order payments',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/cancel
 * Cancel a pending payment
 * 
 * Body:
 *   {
 *     providerId: string
 *   }
 */
router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({
        error: 'Missing required field: providerId',
      });
    }
    
    console.log(`[PaymentRoutes] Cancelling payment ${providerId}`);
    
    const result = await cancelPayment(providerId);
    
    res.status(200).json({
      success: true,
      payment: result,
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Error cancelling payment:', error);
    res.status(500).json({
      error: 'Failed to cancel payment',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/refund
 * Refund a succeeded payment
 * 
 * Body:
 *   {
 *     providerId: string,
 *     amount?: number (optional, full refund if not specified)
 *   }
 */
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { providerId, amount } = req.body;
    
    if (!providerId) {
      return res.status(400).json({
        error: 'Missing required field: providerId',
      });
    }
    
    console.log(`[PaymentRoutes] Refunding payment ${providerId}`);
    
    const result = await refundPayment(providerId, amount);
    
    res.status(200).json({
      success: true,
      payment: result,
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Error refunding payment:', error);
    res.status(500).json({
      error: 'Failed to refund payment',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/upi
 * Fake UPI Payment Simulation
 * --------------------------------------------
 * Body:
 *   { upiId: string }
 * Response:
 *   { status: "success" | "failed", message: string }
 */
router.post("/upi", async (req: Request, res: Response) => {
  try {
    const { upiId } = req.body;

    if (!upiId) {
      return res.status(400).json({
        status: "failed",
        message: "UPI ID is required",
      });
    }

    const result = handleFakeUpiPayment(upiId);

    console.log(`[PaymentRoutes] Fake UPI validation: ${upiId} → ${result.status}`);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[PaymentRoutes] Error in fake UPI route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


export default router;
