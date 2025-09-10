import { Router } from 'express';
import { prisma } from '../db.js';

export const router = Router();

// GET /festivals/upcoming -> list upcoming festivals ordered by start date
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const festivals = await prisma.festival.findMany({
      where: { endDate: { gte: now } },
      orderBy: { startDate: 'asc' }
    });

    res.json(festivals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load festivals' });
  }
});

export default router;

