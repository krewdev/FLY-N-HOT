import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { router as healthRouter } from './routes/health.js';
import { router as authRouter } from './routes/auth.js';
import { router as flightsRouter } from './routes/flights.js';
import { router as pilotFlightsRouter } from './routes/pilotFlights.js';
import { router as bookingsRouter } from './routes/bookings.js';
import webhooksRouter from './routes/webhooks.js';
import { router as notificationsRouter } from './routes/notifications.js';
import adminRouter from './routes/admin.js';
import { tempAuthBypass } from './middleware/auth.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

// Configure CORS based on environment
const corsOptions = {
  origin: env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com'] // Replace with actual domains
    : ['http://localhost:3000', 'http://localhost:3001'], // Development origins
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/health', healthRouter);
app.use('/auth', authLimiter, authRouter);
// Enable temporary pilot auth bypass in development for pilot routes
app.use('/pilots', tempAuthBypass);
app.use('/pilots/flights', pilotFlightsRouter);
app.use('/', flightsRouter);
app.use('/bookings', bookingsRouter);
app.use('/webhooks', webhooksRouter);
app.use('/notifications', notificationsRouter);
app.use('/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;


