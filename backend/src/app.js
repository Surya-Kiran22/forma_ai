import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import schemaRoutes from './routes/schemaRoutes.js';
import extractionRoutes from './routes/extractionRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

const app = express();

// Security CORS config - locked to configured origin in production
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('CORS request blocked: Origin not allowed'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Global rate limiting
app.use(globalRateLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Forma AI Backend Engine',
    timestamp: new Date().toISOString(),
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schemas', schemaRoutes);
app.use('/api/v1/extraction', extractionRoutes);
app.use('/api/v1/drafts', draftRoutes);
app.use('/api/v1/submissions', submissionRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
