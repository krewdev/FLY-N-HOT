import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const router = Router();

const schema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().min(5).optional(),
  zipCode: z.string().min(3).max(10).optional()
}).refine((d) => !!d.email || !!d.phoneNumber, { message: 'email or phoneNumber required' });

router.post('/subscribe', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const existing = await prisma.notificationSubscription.findFirst({
      where: {
        OR: [
          parsed.data.email ? { email: parsed.data.email } : undefined,
          parsed.data.phoneNumber ? { phoneNumber: parsed.data.phoneNumber } : undefined
        ].filter(Boolean) as any
      }
    });
    if (existing) return res.status(200).json({ ok: true, alreadySubscribed: true });
    await prisma.notificationSubscription.create({ data: parsed.data });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
});


