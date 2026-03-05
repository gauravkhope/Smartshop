/**
 * Fake Payment Gateway Implementation
 *
 * ⚠️ WARNING: This is a FAKE payment gateway for demo/portfolio purposes only.
 * NEVER use this in production. NEVER store real card data.
 *
 * This implementation simulates realistic payment flows for:
 * - Card payments (with client secret and confirmation)
 * - UPI payments (with deep links)
 * - Wallet payments (GooglePay/PhonePe style)
 *
 * Testing Controls:
 * - providerId contains "fail" → payment will fail
 * - providerId contains "pending" → payment stays pending (requires webhook)
 * - amount === 999 → simulates network timeout then fails
 * - card_token_demo_4242 → succeeds
 * - demo@upi → succeeds
 * - demo_wallet_01 → succeeds
 */

import {
  PaymentProvider,
  CreatePaymentRequest,
  CreatePaymentResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  WebhookEvent,
  PaymentStatusResponse,
  PaymentStatus,
} from "./paymentProvider";
import { randomUUID } from "crypto";

interface PendingPayment {
  providerId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  method: string;
  clientSecret?: string;
  deeplink?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

/**
 * FakePaymentGateway - Simulates a realistic payment provider
 */
export class FakePaymentGateway implements PaymentProvider {
  readonly name = "fake_gateway";

  // In-memory store for demo purposes (in production, this would be in DB via service layer)
  private payments: Map<string, PendingPayment> = new Map();

  // Configurable delay for async operations (milliseconds)
  private readonly asyncDelay = 2000;

  // Whitelisted last-4 tokens for demo success (from UI sample cards)
  private readonly allowedCardLast4: Set<string> = new Set([
    // VISA (12)
    "4242",
    "1111",
    "1234",
    "6789",
    "0001",
    "2468",
    "1357",
    "9000",
    "7007",
    "8888",
    "1212",
    "3434",
    // MASTERCARD (12)
    "5555",
    "5100",
    "2222",
    "2720",
    "5412",
    "5123",
    "2233",
    "2600",
    "2711",
    "5309",
    "5511",
    "5522",
    // RUPAY (12)
    "6080",
    "6521",
    "5081",
    "8192",
    "8266",
    "6011",
    "6500",
    "5085",
    "8123",
    "8210",
    "6060",
    "6585",
  ]);

  /**
   * Create a new payment
   */
  async createPayment(
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    const { orderId, amount, currency = "INR", method, metadata } = request;

    // Generate provider-specific payment ID
    const providerId = this.generateProviderId(method, amount);

    // Store payment in memory
    const payment: PendingPayment = {
      providerId,
      status: "pending",
      amount,
      currency,
      method,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        ...metadata,
        orderId,
      },
    };

    // Method-specific setup
    switch (method) {
      case "card":
        payment.clientSecret = this.generateClientSecret(providerId);
        this.payments.set(providerId, payment);

        return {
          providerId,
          status: "pending",
          clientSecret: payment.clientSecret,
          metadata: {
            message:
              "Use card_token_demo_4242 for success, card_token_fail for failure",
          },
        };

      case "upi":
        const upiId = `${orderId}@fakegateway`;
        payment.deeplink = `upi://pay?pa=${upiId}&pn=FakeStore&am=${
          amount / 100
        }&cu=${currency}&tn=Order${orderId}`;
        this.payments.set(providerId, payment);

        // Auto-transition for non-pending providerId after delay
        if (!providerId.includes("pending")) {
          this.scheduleAutoTransition(providerId);
        }

        return {
          providerId,
          status: "pending",
          upiDeepLink: payment.deeplink,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            payment.deeplink
          )}&size=200x200`,
          metadata: {
            message:
              'Use demo@upi for success. Contains "fail" in providerId for failure.',
            upiId,
          },
        };

      case "wallet":
        payment.deeplink = `fakewallet://pay?merchantId=FAKE_MERCHANT&orderId=${orderId}&amount=${amount}&currency=${currency}`;
        this.payments.set(providerId, payment);

        // Auto-transition for non-pending providerId after delay
        if (!providerId.includes("pending")) {
          this.scheduleAutoTransition(providerId);
        }

        return {
          providerId,
          status: "pending",
          deeplink: payment.deeplink,
          metadata: {
            message:
              "Use demo_wallet_01 for success. Simulates GooglePay/PhonePe flow.",
          },
        };

      case "netbanking":
        payment.deeplink = `https://fakebank.com/login?merchantId=FAKE&orderId=${orderId}&amount=${amount}`;
        this.payments.set(providerId, payment);

        // Auto-transition for non-pending providerId after delay
        if (!providerId.includes("pending")) {
          this.scheduleAutoTransition(providerId);
        }

        return {
          providerId,
          status: "pending",
          deeplink: payment.deeplink,
          metadata: {
            message: "Net Banking payment. Auto-succeeds in demo mode.",
          },
        };

      case "emi":
        payment.clientSecret = this.generateClientSecret(providerId);
        this.payments.set(providerId, payment);

        return {
          providerId,
          status: "pending",
          clientSecret: payment.clientSecret,
          metadata: {
            message: "EMI payment. Use emi_demo_success for success.",
          },
        };

      case "cod":
        payment.status = "succeeded"; // COD is instantly "succeeded" as confirmation
        this.payments.set(providerId, payment);

        return {
          providerId,
          status: "succeeded",
          metadata: {
            message: "Cash on Delivery confirmed. No online payment required.",
          },
        };

      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(
    request: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> {
    const { providerId, confirmToken } = request;

    const payment = this.payments.get(providerId);

    if (!payment) {
      return {
        providerId,
        status: "failed",
        message: "Payment not found",
        errorCode: "PAYMENT_NOT_FOUND",
      };
    }

    // Idempotency: If already succeeded/failed, return existing status
    if (payment.status === "succeeded") {
      return {
        providerId,
        status: "succeeded",
        message: "Payment already succeeded",
      };
    }

    if (payment.status === "failed") {
      return {
        providerId,
        status: "failed",
        message: "Payment already failed",
        errorCode: "PAYMENT_ALREADY_FAILED",
      };
    }

    // Simulate network timeout for amount === 999
    if (payment.amount === 999) {
      await this.delay(5000);
      payment.status = "failed";
      payment.updatedAt = new Date();
      this.payments.set(providerId, payment);

      return {
        providerId,
        status: "failed",
        message: "Network timeout",
        errorCode: "NETWORK_TIMEOUT",
      };
    }

    // Check if providerId contains "fail" → deterministic failure
    if (providerId.includes("fail")) {
      payment.status = "failed";
      payment.updatedAt = new Date();
      this.payments.set(providerId, payment);

      return {
        providerId,
        status: "failed",
        message: "Payment declined by test rules",
        errorCode: "CARD_DECLINED",
      };
    }

    // Check if providerId contains "pending" → stays pending (except allow manual override for UPI/Wallet)
    if (
      providerId.includes("pending") &&
      payment.method !== "upi" &&
      payment.method !== "wallet"
    ) {
      return {
        providerId,
        status: "pending",
        message: "Payment is pending. Use webhook to complete.",
      };
    }

    // Method-specific confirmation logic
    switch (payment.method) {
      case "card":
        if (!confirmToken) {
          return {
            providerId,
            status: "failed",
            message: "Card token required",
            errorCode: "MISSING_CARD_TOKEN",
          };
        }

        // Validate card token
        if (
          // Legacy test tokens
          confirmToken === "card_token_demo_4242" ||
          confirmToken === "card_token_success" ||
          // UI-generated tokens: card_token_XXXX where XXXX is whitelisted
          (/^card_token_\d{4}$/.test(confirmToken) &&
            this.allowedCardLast4.has(confirmToken.slice(-4)))
        ) {
          payment.status = "succeeded";
          payment.updatedAt = new Date();
          this.payments.set(providerId, payment);

          return {
            providerId,
            status: "succeeded",
            message: "Payment succeeded",
          };
        } else {
          payment.status = "failed";
          payment.updatedAt = new Date();
          this.payments.set(providerId, payment);

          return {
            providerId,
            status: "failed",
            message: "Invalid card token",
            errorCode: "INVALID_CARD",
          };
        }

      case "upi":
      case "wallet":
        // For UPI/Wallet, confirmation is usually async (webhook / polling)
        // Enhance demo: accept any valid UPI ID format (name@handle) or token containing
        // 'success'/'demo' for immediate success. Wallet keeps original token rules.
        if (payment.method === "upi") {
          const VALID_UPI_IDS = [
            "demo@upi",
            "test@okaxis",
            "sample@okhdfcbank",
            "user@okicici",
            "pay@oksbi",
            "order@okbank",
            "gaurav@upi",
            "shop@okicici",
            "client@okaxis",
            "payment@okhdfcbank",
            "check@okicici",
            "cash@okbank",
            "valid1@upi",
            "valid2@upi",
            "valid3@upi",
            "valid4@upi",
            "valid5@upi",
            "valid6@upi",
            "test1@oksbi",
            "test2@oksbi",
            "test3@oksbi",
            "test4@oksbi",
            "test5@oksbi",
            "test6@oksbi",
            "order1@okhdfcbank",
            "order2@okhdfcbank",
            "order3@okhdfcbank",
            "order4@okhdfcbank",
            "order5@okhdfcbank",
            "order6@okhdfcbank",
            "demo1@okaxis",
            "demo2@okaxis",
            "demo3@okaxis",
            "demo4@okaxis",
            "demo5@okaxis",
            "demo6@okaxis",
          ];

          const upiId = (confirmToken || "").trim().toLowerCase();
          const isValid = VALID_UPI_IDS.includes(upiId);

          // Debug log (optional)
          console.log(
            `[FakeGateway][UPI] Confirming ${upiId} => ${
              isValid ? "✅ VALID" : "❌ INVALID"
            }`
          );

          if (isValid) {
            payment.status = "succeeded";
            payment.updatedAt = new Date();
            payment.metadata = {
              ...payment.metadata,
              confirmedVia: "upi_manual",
              upiId,
            };
            this.payments.set(providerId, payment);
            return {
              providerId,
              status: "succeeded",
              message: `✅ Payment Successful (Demo for ${upiId})`,
            };
          } else {
            payment.status = "failed";
            payment.updatedAt = new Date();
            payment.metadata = {
              ...payment.metadata,
              confirmedVia: "upi_manual",
              upiId,
            };
            this.payments.set(providerId, payment);
            return {
              providerId,
              status: "failed",
              message: `❌ Payment Failed - Invalid or unlisted UPI ID (${upiId})`,
              errorCode: "INVALID_UPI_ID",
            };
          }
        } else {
          // Wallet logic (unchanged success triggers)
          if (
            confirmToken &&
            (confirmToken.includes("success") || confirmToken.includes("demo"))
          ) {
            payment.status = "succeeded";
            payment.updatedAt = new Date();
            payment.metadata = {
              ...payment.metadata,
              confirmedVia: "wallet_manual",
              walletToken: confirmToken,
            };
            this.payments.set(providerId, payment);
            return {
              providerId,
              status: "succeeded",
              message: "Wallet payment succeeded",
            };
          }
          return {
            providerId,
            status: "pending",
            message:
              "Wallet payment pending. Use webhook or wait for auto-transition.",
          };
        }

      default:
        return {
          providerId,
          status: "failed",
          message: "Unsupported payment method",
          errorCode: "UNSUPPORTED_METHOD",
        };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    providerId: string
  ): Promise<PaymentStatusResponse | null> {
    const payment = this.payments.get(providerId);

    if (!payment) {
      return null;
    }

    return {
      providerId: payment.providerId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method as any,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      metadata: payment.metadata,
    };
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(
    event: WebhookEvent
  ): Promise<{ success: boolean; message: string }> {
    const { providerId, event: eventType } = event;

    const payment = this.payments.get(providerId);

    if (!payment) {
      return {
        success: false,
        message: "Payment not found",
      };
    }

    // Update payment status based on webhook event
    switch (eventType) {
      case "payment_succeeded":
        if (payment.status === "pending") {
          payment.status = "succeeded";
          payment.updatedAt = new Date();
          this.payments.set(providerId, payment);
          return { success: true, message: "Payment marked as succeeded" };
        }
        return { success: true, message: "Payment already in final state" };

      case "payment_failed":
        if (payment.status === "pending") {
          payment.status = "failed";
          payment.updatedAt = new Date();
          this.payments.set(providerId, payment);
          return { success: true, message: "Payment marked as failed" };
        }
        return { success: true, message: "Payment already in final state" };

      case "payment_refunded":
        payment.status = "refunded";
        payment.updatedAt = new Date();
        this.payments.set(providerId, payment);
        return { success: true, message: "Payment marked as refunded" };

      default:
        return { success: false, message: "Unknown event type" };
    }
  }

  /**
   * Generate provider-specific payment ID
   */
  private generateProviderId(method: string, amount: number): string {
    const suffix = randomUUID().split("-")[0];

    // Special case for testing failure
    if (amount === 998) {
      return `fake_${method}_fail_${suffix}`;
    }

    // Special case for testing pending
    if (amount === 997) {
      return `fake_${method}_pending_${suffix}`;
    }

    return `fake_${method}_${suffix}`;
  }

  /**
   * Generate client secret for card payments
   */
  private generateClientSecret(providerId: string): string {
    return `${providerId}_secret_${randomUUID()}`;
  }

  /**
   * Schedule auto-transition for UPI/Wallet payments (simulates async payment confirmation)
   */
private scheduleAutoTransition(providerId: string): void {
  setTimeout(() => {
    const payment = this.payments.get(providerId);
    if (payment && payment.status === 'pending') {

      // ❌ Skip auto-success for UPI to allow manual confirmation
      if (payment.method === 'upi') {
        console.log(`[FakeGateway][UPI] Skipping auto-transition for ${providerId}`);
        return;
      }

      // ✅ Continue auto-success for other methods
      if (!providerId.includes('fail')) {
        payment.status = 'succeeded';
        payment.updatedAt = new Date();
        this.payments.set(providerId, payment);
        console.log(`[FakeGateway] Auto-transitioned ${providerId} to succeeded`);
      }
    }
  }, this.asyncDelay);
}


  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clear all payments (for testing)
   */
  clearAllPayments(): void {
    this.payments.clear();
  }

  /**
   * Get all payments (for debugging)
   */
  getAllPayments(): PendingPayment[] {
    return Array.from(this.payments.values());
  }
}

// Export singleton instance
export const fakeGateway = new FakePaymentGateway();

//  if (payment.method === 'upi') {
//           const upiPattern = /^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$/;
//           if (
//             confirmToken && (
//               confirmToken.includes('success') ||
//               confirmToken.includes('demo') ||
//               upiPattern.test(confirmToken)
//             )
//           ) {
//             payment.status = 'succeeded';
//             payment.updatedAt = new Date();
//             payment.metadata = { ...payment.metadata, confirmedVia: 'upi_manual', upiId: confirmToken };
//             this.payments.set(providerId, payment);
//             return {
//               providerId,
//               status: 'succeeded',
//               message: 'UPI payment succeeded',
//             };
//           }
//           // Otherwise remain pending for auto-transition / webhook
//           return {
//             providerId,
//             status: 'pending',
//             message: 'UPI payment pending. Waiting for app approval or auto-transition.',
//           };
//         }
