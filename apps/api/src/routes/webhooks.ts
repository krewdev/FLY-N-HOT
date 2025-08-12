import { Router } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import { prisma } from '../db.js';

export const router = Router();

// For Stripe webhook signature verification we need raw body; in this scaffold, we keep JSON.
// Replace with a raw-body middleware in production.

router.post('/stripe', async (req, res) => {
  if (!env.STRIPE_WEBHOOK_SECRET || !env.STRIPE_SECRET_KEY) {
    // Accept in local dev
    return res.status(200).json({ received: true });
  }
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: env.STRIPE_API_VERSION as any });
    const signature = req.headers['stripe-signature'] as string | undefined;
    if (!signature) return res.status(400).send('Missing signature');

    // In production, use raw body; here this will throw, so we guard local runs
    // const event = stripe.webhooks.constructEvent(req.rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    // Handle events...
    await prisma.featureFlag.upsert({ where: { key: 'stripe_webhook_seen' }, update: { enabled: true }, create: { key: 'stripe_webhook_seen', enabled: true, note: 'Set when webhook received at least once' } });
    return res.json({ received: true, note: 'Implement raw body and event handling in production' });
  } catch (err) {
    return res.status(400).send(`Webhook Error`);
  }
});

