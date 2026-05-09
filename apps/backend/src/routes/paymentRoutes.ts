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
import { authenticateToken } from '../middlewares/authMiddleware';
import prisma from '../lib/prisma';
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
  validateDemoCardDetails,
  issueCardConfirmToken,
  consumeCardConfirmToken,
  peekCardConfirmTokenProviderId,
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
router.post('/create', authenticateToken, async (req: Request, res: Response) => {
  try {
    const request: CreatePaymentRequest = req.body;
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
    
    // Validation
    if (!request.orderId || request.amount === undefined || request.amount === null || !request.method) {
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
router.post('/confirm', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { providerId, confirmToken, cardConfirmToken } = req.body as {
      providerId?: string;
      confirmToken?: string;
      cardConfirmToken?: string;
    };

    const effectiveConfirmToken = cardConfirmToken || confirmToken;

    if (!providerId || !effectiveConfirmToken) {
      return res.status(400).json({
        error: 'Missing required fields: providerId and cardConfirmToken',
      });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { providerId },
    });

    if (!existingPayment) {
      return res.status(404).json({
        error: 'Payment not found',
        message: 'No payment exists for the provided providerId',
      });
    }

    if (existingPayment.method === 'card') {
      if (!cardConfirmToken) {
        return res.status(400).json({
          error: 'Missing required fields: providerId and cardConfirmToken',
          message: 'Card confirmation requires cardConfirmToken',
        });
      }

      if (!effectiveConfirmToken.startsWith('CardConfirmToken_')) {
        return res.status(400).json({
          error: 'Invalid CardConfirmToken',
          message: 'Card confirmation requires a backend-issued CardConfirmToken',
        });
      }

      const mappedProviderId = peekCardConfirmTokenProviderId(effectiveConfirmToken);

      if (!mappedProviderId) {
        return res.status(400).json({
          error: 'Invalid CardConfirmToken',
          message: 'CardConfirmToken is invalid or already used',
        });
      }

      if (mappedProviderId !== providerId) {
        return res.status(400).json({
          error: 'Invalid providerId for CardConfirmToken',
          message: 'This CardConfirmToken belongs to a different payment',
        });
      }

      consumeCardConfirmToken(effectiveConfirmToken);
    }

    const request: ConfirmPaymentRequest = {
      providerId,
      confirmToken: effectiveConfirmToken,
    };
    
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
router.get('/status/:providerId', authenticateToken, async (req: Request, res: Response) => {
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
router.get('/order/:orderId', authenticateToken, async (req: Request, res: Response) => {
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
router.post('/cancel', authenticateToken, async (req: Request, res: Response) => {
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
 *     providerId: string
 *   }
 */
router.post('/refund', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { providerId } = req.body;
    const allowedFields = ['providerId'];
    const requestFields = Object.keys(req.body || {});
    const hasUnsupportedField = requestFields.some((field) => !allowedFields.includes(field));
    
    if (!providerId) {
      return res.status(400).json({
        error: 'Missing required field: providerId',
      });
    }

    if (hasUnsupportedField) {
      return res.status(400).json({
        error: 'Invalid request body: only providerId is allowed for refund',
        message: 'Refund supports orignal amount full refund only. Remove amount from request body.',
      });
    }
    
    console.log(`[PaymentRoutes] Refunding payment ${providerId}`);
    
    const result = await refundPayment(providerId);
    
    res.status(200).json({
      success: true,
      payment: result,
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Error refunding payment:', error);

    const errorMessage = error?.message || 'Unknown error';

    if (errorMessage === 'Payment not found') {
      return res.status(404).json({
        error: 'Payment not found',
        message: errorMessage,
      });
    }

    if (errorMessage.startsWith('Cannot refund payment with status:')) {
      return res.status(400).json({
        error: 'Invalid payment status for refund',
        message: errorMessage,
      });
    }

    res.status(500).json({
      error: 'Failed to refund payment',
      message: errorMessage,
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
router.post("/upi", authenticateToken, async (req: Request, res: Response) => {
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

/**
 * POST /api/payments/card
 * Validate a demo card and generate a backend CardConfirmToken
 * --------------------------------------------
 * Body:
 *   {
 *     providerId: string,
 *     cardNumber: string,
 *     cvv: string,
 *     expiryMonth: string,
 *     expiryYear: string
 *   }
 * Response:
 *   { success: true, status: "success", message: string, cardConfirmToken: string }
 */
router.post("/card", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { providerId, cardNumber, cvv, expiryMonth, expiryYear } = req.body;

    if (!providerId) {
      return res.status(400).json({
        status: "failed",
        message: "providerId is required",
      });
    }

    // Validate that providerId exists and belongs to a valid payment
    const payment = await prisma.payment.findUnique({
      where: { providerId },
    });

    if (!payment) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid providerId. Payment not found.",
      });
    }

    const validation = validateDemoCardDetails(cardNumber, cvv, expiryMonth, expiryYear);

    if (!validation.success) {
      return res.status(400).json({
        status: "failed",
        message: validation.message,
      });
    }

    const cardConfirmToken = issueCardConfirmToken(providerId);

    console.log(
      `[PaymentRoutes] Demo card validated for ${validation.last4}; issued ${cardConfirmToken}`
    );

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Card validated successfully. CardConfirmToken Generated.",
      cardConfirmToken,
    });
  } catch (error: any) {
    console.error("[PaymentRoutes] Error in fake card route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


export default router;
