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

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    metadata
  });
  return intent;
}

