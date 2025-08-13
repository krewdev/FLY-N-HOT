import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateAdminSecret } from '../middleware/adminAuth';

const router = Router();
const prisma = new PrismaClient();

// Admin middleware - requires admin role and valid admin secret
router.use(authenticateToken, requireAdmin, validateAdminSecret);

// Get admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const [
      pendingPilots,
      totalPilots,
      totalFlights,
      totalBookings,
      recentAdminActions
    ] = await Promise.all([
      prisma.pilotProfile.count({
        where: { status: 'PENDING' }
      }),
      prisma.pilotProfile.count(),
      prisma.flight.count(),
      prisma.booking.count(),
      prisma.adminAction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      })
    ]);

    res.json({
      pendingPilots,
      totalPilots,
      totalFlights,
      totalBookings,
      recentAdminActions
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

// Get all pending pilot applications
router.get('/pilots/pending', async (req, res) => {
  try {
    const pendingPilots = await prisma.pilotProfile.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            homeZipCode: true,
            createdAt: true
          }
        },
        pilotApplications: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(pendingPilots);
  } catch (error) {
    console.error('Get pending pilots error:', error);
    res.status(500).json({ error: 'Failed to fetch pending pilots' });
  }
});

// Get pilot details for verification
router.get('/pilots/:pilotId', async (req, res) => {
  try {
    const { pilotId } = req.params;
    
    const pilot = await prisma.pilotProfile.findUnique({
      where: { pilotId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            homeZipCode: true,
            createdAt: true
          }
        },
        pilotApplications: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!pilot) {
      return res.status(404).json({ error: 'Pilot not found' });
    }

    res.json(pilot);
  } catch (error) {
    console.error('Get pilot details error:', error);
    res.status(500).json({ error: 'Failed to fetch pilot details' });
  }
});

  // Approve pilot
  router.post('/pilots/:pilotId/approve', async (req, res) => {
    try {
      const { pilotId } = req.params;
      const { notes } = req.body;
      const adminId = req.user!.userId;

    // Update pilot status
    const updatedPilot = await prisma.pilotProfile.update({
      where: { pilotId },
      data: { 
        status: 'APPROVED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });

    // Create admin action record
    await prisma.adminAction.create({
      data: {
        adminId,
        actionType: 'PILOT_APPROVED',
        targetId: pilotId,
        details: { notes, pilotEmail: updatedPilot.user.email }
      }
    });

    // TODO: Send approval email to pilot
    // This would integrate with your email service (SendGrid, etc.)

    res.json({ 
      message: 'Pilot approved successfully',
      pilot: updatedPilot
    });
  } catch (error) {
    console.error('Approve pilot error:', error);
    res.status(500).json({ error: 'Failed to approve pilot' });
  }
});

// Reject pilot
router.post('/pilots/:pilotId/reject', async (req, res) => {
  try {
    const { pilotId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.userId;

    // Update pilot status
    const updatedPilot = await prisma.pilotProfile.update({
      where: { pilotId },
      data: { 
        status: 'REJECTED',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true }
        }
      }
    });

    // Create admin action record
    await prisma.adminAction.create({
      data: {
        adminId,
        actionType: 'PILOT_REJECTED',
        targetId: pilotId,
        details: { reason, pilotEmail: updatedPilot.user.email }
      }
    });

    // TODO: Send rejection email to pilot with reason
    // This would integrate with your email service

    res.json({ 
      message: 'Pilot rejected successfully',
      pilot: updatedPilot
    });
  } catch (error) {
    console.error('Reject pilot error:', error);
    res.status(500).json({ error: 'Failed to reject pilot' });
  }
});

// Suspend pilot
router.post('/pilots/:pilotId/suspend', async (req, res) => {
  try {
    const { pilotId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.userId;

    // Update pilot status
    const updatedPilot = await prisma.pilotProfile.update({
      where: { pilotId },
      data: { 
        status: 'SUSPENDED',
        updatedAt: new Date()
      }
    });

    // Create admin action record
    await prisma.adminAction.create({
      data: {
        adminId,
        actionType: 'PILOT_SUSPENDED',
        targetId: pilotId,
        details: { reason }
      }
    });

    res.json({ 
      message: 'Pilot suspended successfully',
      pilot: updatedPilot
    });
  } catch (error) {
    console.error('Suspend pilot error:', error);
    res.status(500).json({ error: 'Failed to suspend pilot' });
  }
});

// Get all admin actions
router.get('/actions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const actions = await prisma.adminAction.findMany({
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    const total = await prisma.adminAction.count();

    res.json({
      actions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get admin actions error:', error);
    res.status(500).json({ error: 'Failed to fetch admin actions' });
  }
});

export default router;