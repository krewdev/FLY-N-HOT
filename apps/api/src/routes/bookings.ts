import { Router } from 'express';
import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';
import { createPaymentIntent } from '../services/paymentService.js';
import { prisma } from '../db.js';
export const router = Router();

const bookingSchema = z.object({
  flightId: z.string().uuid(),
  passengerId: z.string().uuid(),
  numberOfSeats: z.number().int().positive()
});

router.post('/', async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { flightId, passengerId, numberOfSeats } = parsed.data;

  try {
    const flight = await prisma.flight.findUnique({ where: { flightId } });
    if (!flight) return res.status(404).json({ error: 'Flight not found' });

    const seatsRemaining = flight.totalSeats - flight.seatsReserved;
    if (numberOfSeats > seatsRemaining) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    const total = flight.pricePerSeat * numberOfSeats;

    // Stripe PI (stubbed to create/calc on test mode)
    const paymentIntent = await createPaymentIntent({ amountCents: Math.round(total * 100), metadata: { flightId, passengerId, numberOfSeats: String(numberOfSeats) } });

    // Create a pending booking record; mark PAID after webhook in production
    const booking = await prisma.booking.create({
      data: {
        flightId,
        passengerId,
        numberOfSeats,
        totalAmountPaid: total,
        platformFee: 0, // computed at capture time in real system
        pilotPayoutAmount: total, // placeholder
        paymentStatus: PaymentStatus.PAID, // for scaffold assume immediate success
        stripePaymentIntentId: paymentIntent?.id ?? null
      }
    });

    // Reserve seats
    await prisma.flight.update({ where: { flightId }, data: { seatsReserved: flight.seatsReserved + numberOfSeats } });

    return res.status(201).json({ booking, clientSecret: paymentIntent?.client_secret });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

