import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { notifyPilotApplicationApproved, notifyPilotApplicationSubmitted } from '../services/notificationService.js';
import { env } from '../config/env.js';

export const router = Router();

const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(5),
  password: z.string().min(8)
});

router.post('/signup/password', (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  // Stub only: integrate password hashing + JWT + email/phone uniqueness + roles
  return res.status(501).json({ message: 'Signup not implemented in scaffold' });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/login/password', (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  // Stub only: verify password + issue JWT
  return res.status(501).json({ message: 'Login not implemented in scaffold' });
});

const pilotRegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(5),
  pilotLicenseNumber: z.string().min(3),
  pilotLicenseState: z.string().min(2).max(2),
  zipCode: z.string().min(3).max(10).optional()
});

// Create a pilot application and return an identity session placeholder
router.post('/pilot/register', async (req, res) => {
  const parsed = pilotRegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const app = await prisma.pilotApplication.create({ data: parsed.data });
    await notifyPilotApplicationSubmitted(app.email, app.phoneNumber);
    // In production: create Stripe Identity Verification session and return client_secret
    return res.status(201).json({ applicationId: app.applicationId, identitySessionClientSecret: null });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register pilot' });
  }
});

// Admin: list pilot applications (stub auth)
router.get('/pilot/applications', async (_req, res) => {
  // Require admin secret - if not configured, deny access
  if (!env.ADMIN_SECRET) {
    return res.status(503).json({ error: 'Admin authentication not configured' });
  }
  if (_req.headers['x-admin-secret'] !== env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized - invalid admin secret' });
  }
  
  try {
    const apps = await prisma.pilotApplication.findMany({ 
      orderBy: { createdAt: 'desc' },
      select: {
        applicationId: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        zipCode: true,
        status: true,
        pilotLicenseNumber: true,
        pilotLicenseState: true,
        licenseConfirmed: true,
        licenseConfirmedAt: true,
        createdAt: true
      }
    });
    return res.json(apps);
  } catch (err) {
    console.error('Failed to list pilot applications:', err);
    return res.status(500).json({ error: 'Failed to list applications' });
  }
});

// Admin: manually confirm a pilot's license number
router.post('/pilot/applications/:applicationId/confirm-license', async (req, res) => {
  // Require admin secret - if not configured, deny access
  if (!env.ADMIN_SECRET) {
    return res.status(503).json({ error: 'Admin authentication not configured' });
  }
  if (req.headers['x-admin-secret'] !== env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized - invalid admin secret' });
  }

  const { applicationId } = req.params;
  if (!applicationId) {
    return res.status(400).json({ error: 'Application ID is required' });
  }

  try {
    // Check if application exists and is not already confirmed
    const existingApp = await prisma.pilotApplication.findUnique({
      where: { applicationId }
    });
    
    if (!existingApp) {
      return res.status(404).json({ error: 'Pilot application not found' });
    }
    
    if (existingApp.licenseConfirmed) {
      return res.status(400).json({ error: 'License already confirmed' });
    }

    const updated = await prisma.pilotApplication.update({
      where: { applicationId },
      data: { 
        licenseConfirmed: true, 
        licenseConfirmedAt: new Date(),
        status: 'VERIFIED'
      }
    });
    
    await notifyPilotApplicationApproved(updated.email, updated.phoneNumber);
    return res.json(updated);
  } catch (err) {
    console.error('Failed to confirm pilot license:', err);
    return res.status(500).json({ error: 'Failed to confirm license' });
  }
});

