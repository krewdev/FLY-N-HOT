import { Router } from 'express';
import { z } from 'zod';

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

