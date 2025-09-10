import { Router } from 'express';
import { prisma } from '../db.js';

export const router = Router();

// GET /pilots -> list approved pilots with display name
router.get('/', async (req, res) => {
  try {
    const pilots = await prisma.pilotProfile.findMany({
      where: { status: 'APPROVED' },
      include: { user: true }
    });

    const result = pilots.map((p: any) => ({
      pilotId: p.pilotId,
      name: `${p.user.firstName} ${p.user.lastName}`.trim()
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load pilots' });
  }
});

export default router;

