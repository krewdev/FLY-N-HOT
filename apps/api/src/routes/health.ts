import { Router } from 'express';
import { prisma } from '../db.js';

export const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/flags', async (_req, res) => {
  try {
    const flags = await prisma.featureFlag.findMany();
    res.json(flags);
  } catch {
    res.json([]);
  }
});

