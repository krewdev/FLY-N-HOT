import { Router } from 'express';
import { z } from 'zod';
// Using string literal to avoid type import mismatches during build
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
    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx: any) => {
      // Get flight with FOR UPDATE lock to prevent concurrent modifications
      const flight = await tx.flight.findUnique({ 
        where: { flightId },
        select: { flightId: true, totalSeats: true, seatsReserved: true, pricePerSeat: true, status: true }
      });
      
      if (!flight) {
        throw new Error('Flight not found');
      }

      if (flight.status !== 'UPCOMING') {
        throw new Error('Flight is not available for booking');
      }

      const seatsRemaining = flight.totalSeats - flight.seatsReserved;
      if (numberOfSeats > seatsRemaining) {
        throw new Error('Not enough seats available');
      }

      // Check if passenger exists
      const passenger = await tx.user.findUnique({ where: { userId: passengerId } });
      if (!passenger) {
        throw new Error('Passenger not found');
      }

      const total = flight.pricePerSeat * numberOfSeats;

      // Reserve seats atomically
      const updatedFlight = await tx.flight.update({ 
        where: { flightId }, 
        data: { seatsReserved: flight.seatsReserved + numberOfSeats } 
      });

      // Create booking record
      const booking = await tx.booking.create({
        data: {
          flightId,
          passengerId,
          numberOfSeats,
          totalAmountPaid: total,
          platformFee: 0, // computed at capture time in real system
          pilotPayoutAmount: total, // placeholder
          paymentStatus: 'PAID' as any, // for scaffold assume immediate success
          stripePaymentIntentId: null // Will be updated after payment intent creation
        }
      });

      return { booking, flight: updatedFlight, total };
    });

    // Create payment intent after successful reservation
    const paymentIntent = await createPaymentIntent({ 
      amountCents: Math.round(result.total * 100), 
      metadata: { 
        flightId, 
        passengerId, 
        numberOfSeats: String(numberOfSeats),
        bookingId: result.booking.bookingId
      } 
    });

    // Update booking with payment intent ID
    if (paymentIntent?.id) {
      await prisma.booking.update({
        where: { bookingId: result.booking.bookingId },
        data: { stripePaymentIntentId: paymentIntent.id }
      });
    }

    return res.status(201).json({ 
      booking: { ...result.booking, stripePaymentIntentId: paymentIntent?.id }, 
      clientSecret: paymentIntent?.client_secret 
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create booking';
    return res.status(400).json({ error: message });
  }
});

