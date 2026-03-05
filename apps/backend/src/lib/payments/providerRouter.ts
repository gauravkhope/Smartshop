/**
 * Payment Provider Router
 * 
 * Factory to select and return the appropriate payment provider implementation.
 * This allows easy switching between different payment gateways (Fake, Stripe, Razorpay, etc.)
 */

import { PaymentProvider } from './paymentProvider';
import { fakeGateway } from './fakeGateway';

export type SupportedProvider = 'fake_gateway' | 'stripe' | 'razorpay';

/**
 * Get payment provider instance by name
 * 
 * @param providerName - Name of the payment provider
 * @returns PaymentProvider instance
 * @throws Error if provider is not supported
 */
export function getPaymentProvider(providerName: SupportedProvider = 'fake_gateway'): PaymentProvider {
  switch (providerName) {
    case 'fake_gateway':
      return fakeGateway;
    
    case 'stripe':
      // TODO: Implement Stripe provider
      throw new Error('Stripe provider not yet implemented. Use fake_gateway for now.');
    
    case 'razorpay':
      // TODO: Implement Razorpay provider
      throw new Error('Razorpay provider not yet implemented. Use fake_gateway for now.');
    
    default:
      throw new Error(`Unsupported payment provider: ${providerName}`);
  }
}

/**
 * Get default payment provider (can be configured via env variables)
 */
export function getDefaultProvider(): PaymentProvider {
  const providerName = (process.env.PAYMENT_PROVIDER || 'fake_gateway') as SupportedProvider;
  return getPaymentProvider(providerName);
}

/**
 * Check if a provider is supported
 */
export function isProviderSupported(providerName: string): boolean {
  return ['fake_gateway', 'stripe', 'razorpay'].includes(providerName);
}

/**
 * Get list of all supported providers
 */
export function getSupportedProviders(): SupportedProvider[] {
  return ['fake_gateway', 'stripe', 'razorpay'];
}
