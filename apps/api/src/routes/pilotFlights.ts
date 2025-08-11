import { Router } from 'express';
import { z } from 'zod';
import { FlightStatus } from '@prisma/client';
import { prisma } from '../db.js';

export const router = Router();

const createFlightSchema = z.object({
  launchLocation: z.object({ type: z.literal('Point'), coordinates: z.tuple([z.number(), z.number()]) }),
  meetupTimestamp: z.string(), // ISO datetime
  estimatedDurationMinutes: z.number().int().min(1),
  pricePerSeat: z.number().positive(),
  totalSeats: z.number().int().positive(),
  description: z.string().optional()
});

// In a real app, infer pilotId from auth token
router.post('/', async (req, res) => {
  const parsed = createFlightSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const pilotId = (req as any).pilotId || req.query.pilotId; // temp
  if (!pilotId || typeof pilotId !== 'string') return res.status(400).json({ error: 'pilotId required' });

  const { launchLocation, meetupTimestamp, estimatedDurationMinutes, pricePerSeat, totalSeats, description } = parsed.data;
  try {
    const flight = await prisma.flight.create({
      data: {
        pilotId,
        launchLocation,
        meetupTimestamp: new Date(meetupTimestamp),
        estimatedDurationMinutes,
        pricePerSeat,
        totalSeats,
        description: description ?? null,
        status: FlightStatus.UPCOMING
      }
    });
    return res.status(201).json(flight);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create flight' });
  }
});

router.get('/', async (req, res) => {
  const pilotId = (req as any).pilotId || req.query.pilotId; // temp
  if (!pilotId || typeof pilotId !== 'string') return res.status(400).json({ error: 'pilotId required' });
  try {
    const flights = await prisma.flight.findMany({ where: { pilotId }, orderBy: { meetupTimestamp: 'asc' } });
    return res.json(flights);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list flights' });
  }
});

