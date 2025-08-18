import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { notifyPassengers } from '../services/notificationService.js';
import crypto from 'crypto';

export const router = Router();

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(5),
  birthday: z.string().datetime().or(z.string().min(6)),
  weight: z.number().int().min(50).max(400),
  zipCode: z.string().min(3).max(10).optional(),
  selectionType: z.enum(['pilot', 'festival']),
  selectionId: z.string().min(2)
});

router.post('/subscribe', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const { name, email, phoneNumber, birthday, weight, zipCode, selectionType, selectionId } = parsed.data as any;
    const existing = await prisma.notificationSubscription.findFirst({
      where: {
        email,
        phoneNumber
      }
    });
    if (existing) return res.status(200).json({ ok: true, alreadySubscribed: true });

    await prisma.notificationSubscription.create({
      data: {
        name,
        email,
        phoneNumber,
        birthday: new Date(birthday),
        weight,
        zipCode: zipCode ?? null
      }
    });

    // Record association to pilot/festival in a simple join table (create if not exists)
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "NotificationTarget" (
        "id" text PRIMARY KEY,
        "email" text NOT NULL,
        "phoneNumber" text NOT NULL,
        "selectionType" text NOT NULL,
        "selectionId" text NOT NULL,
        "createdAt" timestamptz DEFAULT now()
      )`
    );

    const id = crypto.randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "NotificationTarget" ("id", "email", "phoneNumber", "selectionType", "selectionId") VALUES ($1, $2, $3, $4, $5)`,
      id,
      email,
      phoneNumber,
      selectionType,
      selectionId
    );

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Pilot triggers notifications to their subscribers about an opening
router.post('/notify/pilot/:pilotId', async (req, res) => {
  try {
    const { pilotId } = req.params;
    const subs = await prisma.$queryRawUnsafe<any[]>(
      `SELECT DISTINCT email, phoneNumber FROM "NotificationTarget" WHERE "selectionType" = 'pilot' AND "selectionId" = $1`,
      pilotId
    );

    const emails = subs.map((s) => s.email).filter(Boolean);
    const phones = subs.map((s) => s.phoneNumber).filter(Boolean);

    await notifyPassengers({ phoneNumbers: phones });
    // TODO: send emails via provider too

    return res.json({ notified: { emails: emails.length, sms: phones.length } });
  } catch (err) {
    console.error('Notify pilot subscribers error:', err);
    return res.status(500).json({ error: 'Failed to send notifications' });
  }
});


