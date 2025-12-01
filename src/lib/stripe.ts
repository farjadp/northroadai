import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe client instance (lazy initialization)
 * This prevents build-time errors when STRIPE_SECRET_KEY is not available
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }

    stripeInstance = new Stripe(apiKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });
  }

  return stripeInstance;
}

// For backward compatibility, export a getter
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
  get customers() {
    return getStripe().customers;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get paymentIntents() {
    return getStripe().paymentIntents;
  },
  // Add other Stripe resources as needed
} as Stripe;