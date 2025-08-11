import { Router } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env.js';

export const router = Router();

// For Stripe webhook signature verification we need raw body; in this scaffold, we keep JSON.
// Replace with a raw-body middleware in production.

router.post('/stripe', async (req, res) => {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY) {
    // Accept in local dev
    return res.status(200).json({ received: true });
  }
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
    const signature = req.headers['stripe-signature'] as string | undefined;
    if (!signature) return res.status(400).send('Missing signature');

    // In production, use raw body; here this will throw, so we guard local runs
    // const event = stripe.webhooks.constructEvent(req.rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    // Handle events...
    return res.json({ received: true, note: 'Implement raw body and event handling in production' });
  } catch (err) {
    return res.status(400).send(`Webhook Error`);
  }
});

