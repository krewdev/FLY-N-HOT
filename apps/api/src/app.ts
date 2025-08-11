import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as healthRouter } from './routes/health.js';
import { router as authRouter } from './routes/auth.js';
import { router as flightsRouter } from './routes/flights.js';
import { router as pilotFlightsRouter } from './routes/pilotFlights.js';
import { router as bookingsRouter } from './routes/bookings.js';
import { router as webhooksRouter } from './routes/webhooks.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/pilots/flights', pilotFlightsRouter);
app.use('/', flightsRouter);
app.use('/bookings', bookingsRouter);
app.use('/webhooks', webhooksRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;


