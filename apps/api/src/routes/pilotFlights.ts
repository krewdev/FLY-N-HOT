import { Router } from 'express';
import { z } from 'zod';
import { FlightStatus } from '@prisma/client';
import { prisma } from '../db.js';

export const router = Router();

const createFlightSchema = z.object({
  launchLocation: z.object({ type: z.literal('Point'), coordinates: z.tuple([z.number(), z.number()]) }),
  meetupTimestamp: z.string().datetime().refine((date) => {
    const meetupTime = new Date(date);
    const now = new Date();
    return meetupTime > now;
  }, { message: "Meetup timestamp must be in the future" }),
  estimatedDurationMinutes: z.number().int().min(1).max(1440), // Max 24 hours
  pricePerSeat: z.number().positive().max(10000), // Reasonable max price
  totalSeats: z.number().int().positive().max(50), // Reasonable max seats
  description: z.string().max(1000).optional()
});

// In a real app, infer pilotId from auth token
router.post('/', async (req, res) => {
  const parsed = createFlightSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Temporary: get pilotId from query param until auth is implemented
  const pilotId = req.pilotId || (typeof req.query.pilotId === 'string' ? req.query.pilotId : undefined);
  if (!pilotId) {
    return res.status(401).json({ error: 'Pilot authentication required. Provide pilotId in query param for now.' });
  }

  // Validate pilotId exists and is a valid pilot
  try {
    const pilot = await prisma.pilotProfile.findUnique({ where: { pilotId } });
    if (!pilot) {
      return res.status(404).json({ error: 'Pilot profile not found' });
    }
    if (pilot.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Pilot is not approved to create flights' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to validate pilot' });
  }

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
  // Temporary: get pilotId from query param until auth is implemented
  const pilotId = req.pilotId || (typeof req.query.pilotId === 'string' ? req.query.pilotId : undefined);
  if (!pilotId) {
    return res.status(401).json({ error: 'Pilot authentication required. Provide pilotId in query param for now.' });
  }

  try {
    // Validate pilot exists
    const pilot = await prisma.pilotProfile.findUnique({ where: { pilotId } });
    if (!pilot) {
      return res.status(404).json({ error: 'Pilot profile not found' });
    }

    const flights = await prisma.flight.findMany({ 
      where: { pilotId }, 
      orderBy: { meetupTimestamp: 'asc' },
      include: {
        bookings: {
          select: { bookingId: true, numberOfSeats: true, paymentStatus: true }
        }
      }
    });
    return res.json(flights);
  } catch (err) {
    console.error('Failed to list pilot flights:', err);
    return res.status(500).json({ error: 'Failed to list flights' });
  }
});

