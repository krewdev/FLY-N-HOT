import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../db.js';
import { AuthService } from '../services/authService.js';
import { authenticateToken } from '../middleware/auth.js';
import { notifyPilotApplicationApproved, notifyPilotApplicationSubmitted } from '../services/notificationService.js';
import { env } from '../config/env.js';

export const router = Router();

const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(5),
  password: z.string().min(8),
  homeZipCode: z.string().min(5).max(10).optional(),
  role: z.enum(['PASSENGER', 'PILOT']).default('PASSENGER')
});

router.post('/signup/password', async (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }

  const { firstName, lastName, email, phoneNumber, password, homeZipCode, role } = parse.data;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered' 
      });
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        passwordHash,
        homeZipCode,
        role: role as Role
      }
    });

    // Generate token
    const token = AuthService.generateToken(user);

    // Return user data without sensitive info
    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/login/password', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }

  const { email, password } = parse.data;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await AuthService.verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = AuthService.generateToken(user);

    // Return user data without sensitive info
    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.user!.userId },
      include: {
        pilotProfile: {
          select: {
            pilotId: true,
            status: true,
            stripeAccountStatus: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user info' });
  }
});

const pilotRegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(5),
  password: z.string().min(8),
  pilotLicenseNumber: z.string().min(3),
  pilotLicenseState: z.string().min(2).max(2),
  zipCode: z.string().min(3).max(10).optional()
});

// Create a pilot application and user account
router.post('/pilot/register', async (req, res) => {
  const parsed = pilotRegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const { firstName, lastName, email, phoneNumber, password, pilotLicenseNumber, pilotLicenseState, zipCode } = parsed.data;
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered' 
      });
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(password);

    // Create user and pilot profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user with PILOT role
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          phoneNumber,
          passwordHash,
          homeZipCode: zipCode,
          role: 'PILOT'
        }
      });

      // Create pilot profile with PENDING status
      const pilotProfile = await tx.pilotProfile.create({
        data: {
          userId: user.userId,
          status: 'PENDING'
        }
      });

      // Create pilot application
      const application = await tx.pilotApplication.create({
        data: {
          firstName,
          lastName,
          email,
          phoneNumber,
          pilotLicenseNumber,
          pilotLicenseState,
          zipCode,
          pilotId: pilotProfile.pilotId
        }
      });

      return { user, pilotProfile, application };
    });

    // Send notification
    await notifyPilotApplicationSubmitted(email, phoneNumber);

    // Generate token
    const token = AuthService.generateToken(result.user);

    // Return response without sensitive data
    const { passwordHash: _, ...userWithoutPassword } = result.user;

    return res.status(201).json({ 
      user: userWithoutPassword,
      pilotId: result.pilotProfile.pilotId,
      applicationId: result.application.applicationId,
      token,
      identitySessionClientSecret: null // In production: create Stripe Identity Verification session
    });
  } catch (err) {
    console.error('Pilot registration error:', err);
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

