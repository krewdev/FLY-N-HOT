import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export class StripeService {
  // Create Stripe Connect account for pilot
  static async createConnectAccount(pilotId: string, email: string, country: string = 'US') {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      });

      // Update pilot profile with Stripe Connect account ID
      await prisma.pilotProfile.update({
        where: { pilotId },
        data: {
          stripeConnectAccountId: account.id,
          stripeAccountStatus: 'PENDING'
        }
      });

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/pilot/onboarding`,
        return_url: `${process.env.FRONTEND_URL}/pilot/dashboard`,
        type: 'account_onboarding',
      });

      return {
        accountId: account.id,
        accountLink: accountLink.url,
        status: account.charges_enabled
      };
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      throw new Error('Failed to create Stripe Connect account');
    }
  }

  // Create Stripe product and price for a flight
  static async createFlightProduct(flightId: string, pilotId: string, flightData: {
    description: string;
    pricePerSeat: number;
    totalSeats: number;
  }) {
    try {
      // Get pilot's Stripe Connect account
      const pilot = await prisma.pilotProfile.findUnique({
        where: { pilotId },
        select: { stripeConnectAccountId: true }
      });

      if (!pilot?.stripeConnectAccountId) {
        throw new Error('Pilot not connected to Stripe');
      }

      // Create product in pilot's Stripe account
      const product = await stripe.products.create({
        name: `Hot Air Balloon Flight - ${flightData.description}`,
        description: flightData.description,
        metadata: {
          flightId,
          pilotId,
          totalSeats: flightData.totalSeats.toString()
        }
      }, {
        stripeAccount: pilot.stripeConnectAccountId
      });

      // Create price in pilot's Stripe account
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(flightData.pricePerSeat * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          flightId,
          pilotId
        }
      }, {
        stripeAccount: pilot.stripeConnectAccountId
      });

      // Create payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [{
          price: price.id,
          quantity: 1,
        }],
        application_fee_amount: Math.round(flightData.pricePerSeat * 10), // 10% platform fee
        transfer_data: {
          destination: pilot.stripeConnectAccountId,
        },
        metadata: {
          flightId,
          pilotId
        }
      }, {
        stripeAccount: pilot.stripeConnectAccountId
      });

      // Update flight with Stripe IDs
      await prisma.flight.update({
        where: { flightId },
        data: {
          stripeProductId: product.id,
          stripePriceId: price.id,
          stripePaymentLinkId: paymentLink.id
        }
      });

      return {
        productId: product.id,
        priceId: price.id,
        paymentLinkId: paymentLink.id,
        paymentUrl: paymentLink.url
      };
    } catch (error) {
      console.error('Error creating flight product:', error);
      throw new Error('Failed to create flight product in Stripe');
    }
  }

  // Handle Stripe webhook events
  static async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'account.updated':
          await this.handleAccountUpdate(event.data.object as Stripe.Account);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Handle successful payment
  private static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    try {
      const { flightId, pilotId, numberOfSeats } = paymentIntent.metadata;
      
      if (!flightId || !pilotId || !numberOfSeats) {
        throw new Error('Missing metadata in payment intent');
      }

      // Get flight details
      const flight = await prisma.flight.findUnique({
        where: { flightId },
        select: { 
          pricePerSeat: true, 
          seatsReserved: true, 
          totalSeats: true,
          platformFeePercentage: true
        }
      });

      if (!flight) {
        throw new Error('Flight not found');
      }

      const numberOfSeatsInt = parseInt(numberOfSeats);
      const totalAmount = flight.pricePerSeat * numberOfSeatsInt;
      const platformFee = totalAmount * flight.platformFeePercentage;
      const pilotPayout = totalAmount - platformFee;

      // Create booking record
      await prisma.booking.create({
        data: {
          flightId,
          passengerId: paymentIntent.metadata.passengerId || 'unknown',
          numberOfSeats: numberOfSeatsInt,
          totalAmountPaid: totalAmount,
          platformFee,
          pilotPayoutAmount: pilotPayout,
          paymentStatus: 'PAID',
          stripePaymentIntentId: paymentIntent.id
        }
      });

      // Update flight seats
      await prisma.flight.update({
        where: { flightId },
        data: {
          seatsReserved: {
            increment: numberOfSeatsInt
          }
        }
      });

      console.log(`Payment successful for flight ${flightId}, ${numberOfSeats} seats booked`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  // Handle failed payment
  private static async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    try {
      const { flightId } = paymentIntent.metadata;
      
      if (flightId) {
        // Update flight status or send notification
        console.log(`Payment failed for flight ${flightId}`);
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }

  // Handle Stripe Connect account updates
  private static async handleAccountUpdate(account: Stripe.Account) {
    try {
      // Find pilot by Stripe Connect account ID
      const pilot = await prisma.pilotProfile.findFirst({
        where: { stripeConnectAccountId: account.id }
      });

      if (pilot) {
        // Update pilot's Stripe account status
        let status: 'PENDING' | 'ACTIVE' | 'RESTRICTED' | 'DISABLED' = 'PENDING';
        
        if (account.charges_enabled && account.payouts_enabled) {
          status = 'ACTIVE';
        } else if (account.charges_enabled) {
          status = 'PENDING';
        } else if (account.details_submitted) {
          status = 'RESTRICTED';
        }

        await prisma.pilotProfile.update({
          where: { pilotId: pilot.pilotId },
          data: { stripeAccountStatus: status }
        });

        console.log(`Updated Stripe account status for pilot ${pilot.pilotId}: ${status}`);
      }
    } catch (error) {
      console.error('Error handling account update:', error);
      throw error;
    }
  }

  // Get pilot's Stripe Connect account status
  static async getAccountStatus(pilotId: string) {
    try {
      const pilot = await prisma.pilotProfile.findUnique({
        where: { pilotId },
        select: { 
          stripeConnectAccountId: true, 
          stripeAccountStatus: true 
        }
      });

      if (!pilot?.stripeConnectAccountId) {
        return { connected: false, status: 'NOT_CONNECTED' };
      }

      const account = await stripe.accounts.retrieve(pilot.stripeConnectAccountId);
      
      return {
        connected: true,
        status: pilot.stripeAccountStatus,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      };
    } catch (error) {
      console.error('Error getting account status:', error);
      throw new Error('Failed to get Stripe account status');
    }
  }

  // Retrieve payment link URL for a flight
  static async getPaymentLinkUrl(paymentLinkId: string, pilotId: string) {
    try {
      const pilot = await prisma.pilotProfile.findUnique({
        where: { pilotId },
        select: { stripeConnectAccountId: true }
      });
      if (!pilot?.stripeConnectAccountId) {
        return null;
      }
      const link = await stripe.paymentLinks.retrieve(paymentLinkId, {
        stripeAccount: pilot.stripeConnectAccountId
      });
      return link.url;
    } catch (error) {
      console.error('Error retrieving payment link:', error);
      return null;
    }
  }
}