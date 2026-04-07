import 'dotenv/config';
console.log('CLERK PUBKEY LOADED:', process.env.CLERK_PUBLISHABLE_KEY ? process.env.CLERK_PUBLISHABLE_KEY.substring(0, 10) + '...' : 'UNDEFINED');
console.log('CLERK SECRET LOADED:', process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.substring(0, 10) + '...' : 'UNDEFINED');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { clerkMiddleware } from '@clerk/express';

import linksRouter from './routes/links.js';
import collectionsRouter from './routes/collections.js';
import analyticsRouter from './routes/analytics.js';
import profileRouter from './routes/profile.js';
import paymentRouter from './routes/payment.js';
import publicRouter from './routes/public.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean), credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Clerk middleware - must come before routes
app.use(clerkMiddleware());

// Routes
app.use('/api/links', linksRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/public', publicRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(` LinkVault API running on port ${PORT}`));

export default app;
