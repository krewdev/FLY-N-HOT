import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const router = Router();

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  phoneNumber: z.string().min(5).optional(),
  birthday: z.string().optional(),
  weight: z.coerce.number().int().min(50).max(800).optional(),
  zipCode: z.string().min(3).max(10).optional(),
  pilotId: z.string().uuid().optional(),
  festivalId: z.string().uuid().optional()
}).refine((d) => !!d.email || !!d.phone || !!d.phoneNumber, { message: 'email or phone required' });

router.post('/subscribe', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const phoneNormalized = parsed.data.phoneNumber || parsed.data.phone;
    const existing = await prisma.notificationSubscription.findFirst({
      where: {
        OR: [
          parsed.data.email ? { email: parsed.data.email } : undefined,
          phoneNormalized ? { phoneNumber: phoneNormalized } : undefined
        ].filter(Boolean) as any
      }
    });
    if (existing) return res.status(200).json({ ok: true, alreadySubscribed: true });
    const birthday = parsed.data.birthday ? new Date(parsed.data.birthday) : new Date('1970-01-01');
    await prisma.notificationSubscription.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email || '',
        phoneNumber: phoneNormalized || '',
        birthday,
        weight: parsed.data.weight ?? 0,
        zipCode: parsed.data.zipCode,
        pilotId: parsed.data.pilotId,
        festivalId: parsed.data.festivalId,
      } as any
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
});


