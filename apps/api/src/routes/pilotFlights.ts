import { Router } from 'express';
import { z } from 'zod';
import { FlightStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { StripeService } from '../services/stripe.js';
import { notifyPassengers } from '../services/notificationService.js';
import { authenticateToken, requirePilot } from '../middleware/auth.js';

export const router = Router();

// Apply authentication middleware to all pilot routes
router.use(authenticateToken, requirePilot);

const createFlightSchema = z.object({
  // Accept any JSON for now to support address-based locations during dev
  launchLocation: z.any(),
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

// Create a new flight
router.post('/', async (req, res) => {
  const parsed = createFlightSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const pilotId = req.pilotId!; // Guaranteed by requirePilot middleware

  // Validate pilot is approved
  try {
    const pilot = await prisma.pilotProfile.findUnique({ where: { pilotId }, include: { user: true } });
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
    // Create Stripe product/price/payment link for this flight if connected
    try {
      const stripeResult = await StripeService.createFlightProduct(
        flight.flightId,
        pilotId,
        {
          description: description ?? `Flight on ${new Date(meetupTimestamp).toLocaleString()}`,
          pricePerSeat,
          totalSeats
        }
      );
      return res.status(201).json({ ...flight, stripe: stripeResult });
    } catch (stripeErr) {
      // Still return flight; Stripe can be set up later
      console.warn('Stripe product creation failed, returning flight without payment link.');
      return res.status(201).json(flight);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create flight' });
  }
});

router.get('/', async (req, res) => {
  const pilotId = req.pilotId!; // Guaranteed by requirePilot middleware

  try {
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

// Notify subscribers for a specific flight (pilot-triggered)
router.post('/:flightId/notify', async (req, res) => {
  const pilotId = req.pilotId!; // Guaranteed by requirePilot middleware
  const { flightId } = req.params;
  try {
    // Ensure flight belongs to pilot
    const flight = await prisma.flight.findUnique({ where: { flightId } });
    if (!flight || flight.pilotId !== pilotId) {
      return res.status(404).json({ error: 'Flight not found for this pilot' });
    }

    // Fetch subscribers from NotificationTarget join (dev scaffold)
    const subs = await prisma.$queryRawUnsafe<any[]>(
      `SELECT DISTINCT email, phoneNumber FROM "NotificationTarget" WHERE "selectionType" = 'pilot' AND "selectionId" = $1`,
      pilotId
    );
    const phones = subs.map((s) => s.phonenumber || s.phoneNumber).filter(Boolean);
    await notifyPassengers({ phoneNumbers: phones, deepLinkUrl: `${process.env.FRONTEND_URL}/flights/${flightId}` });
    return res.json({ ok: true, sms: phones.length });
  } catch (err) {
    console.error('Notify flight subscribers error:', err);
    return res.status(500).json({ error: 'Failed to notify subscribers' });
  }
});

// Stripe status for pilot
router.get('/stripe-status', async (req, res) => {
  try {
    const pilotId = req.pilotId!; // Guaranteed by requirePilot middleware
    const status = await StripeService.getAccountStatus(pilotId);
    return res.json(status);
  } catch (err) {
    console.error('Stripe status error:', err);
    return res.status(500).json({ error: 'Failed to get Stripe status' });
  }
});

// Connect Stripe for pilot (returns onboarding link)
router.post('/connect-stripe', async (req, res) => {
  try {
    const pilotId = req.pilotId!; // Guaranteed by requirePilot middleware
    const pilot = await prisma.pilotProfile.findUnique({ where: { pilotId }, include: { user: true } });
    if (!pilot) return res.status(404).json({ error: 'Pilot not found' });
    const result = await StripeService.createConnectAccount(pilotId, pilot.user.email);
    return res.json(result);
  } catch (err) {
    console.error('Connect Stripe error:', err);
    return res.status(500).json({ error: 'Failed to connect Stripe' });
  }
});

