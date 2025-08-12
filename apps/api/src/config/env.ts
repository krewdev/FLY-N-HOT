import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32).refine((secret) => {
    if (process.env.NODE_ENV === 'production' && secret === 'change_me') {
      throw new Error('JWT_SECRET must be changed from default value in production');
    }
    return true;
  }, { message: "JWT_SECRET must be at least 32 characters and not 'change_me' in production" }),
  ADMIN_SECRET: z.string().min(16).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  STRIPE_API_VERSION: z.string().default('2024-04-10'),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),

  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional()
});

export const env = envSchema.parse(process.env);

