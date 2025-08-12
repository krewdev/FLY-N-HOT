import Stripe from 'stripe';
import { env } from '../config/env.js';

type CreatePaymentIntentInput = {
  amountCents: number;
  currency?: string;
  metadata?: Record<string, string>;
};

export async function createPaymentIntent(input: CreatePaymentIntentInput) {
  const { amountCents, currency = 'usd', metadata } = input;

  if (!env.STRIPE_SECRET_KEY) {
    return { id: 'pi_dummy', client_secret: 'pi_dummy_secret' } as any;
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: env.STRIPE_API_VERSION as any });
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    metadata
  });
  return intent;
}

