import { Router } from 'express';
import { z } from 'zod';
import { FlightStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { StripeService } from '../services/stripe.js';
export const router = Router();

const createFlightSchema = z.object({
  pilotId: z.string().uuid(),
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

router.post('/flights', async (req, res) => {
  const parsed = createFlightSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { pilotId, launchLocation, meetupTimestamp, estimatedDurationMinutes, pricePerSeat, totalSeats, description } = parsed.data;

  try {
    // Validate pilot exists and is approved
    const pilot = await prisma.pilotProfile.findUnique({ where: { pilotId } });
    if (!pilot) {
      return res.status(404).json({ error: 'Pilot profile not found' });
    }
    if (pilot.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Pilot is not approved to create flights' });
    }

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
    console.error('Failed to create flight:', err);
    return res.status(500).json({ error: 'Failed to create flight' });
  }
});

router.get('/flights', async (_req, res) => {
  try {
    const flights = await prisma.flight.findMany({ orderBy: { meetupTimestamp: 'asc' } });
    return res.json(flights);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list flights' });
  }
});

router.get('/flights/:flightId', async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({ where: { flightId: req.params.flightId } });
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    let paymentUrl: string | undefined;
    if (flight.stripePaymentLinkId) {
      paymentUrl = await StripeService.getPaymentLinkUrl(flight.stripePaymentLinkId, flight.pilotId) || undefined;
    }
    return res.json({ ...flight, stripePaymentLinkUrl: paymentUrl });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get flight' });
  }
});

