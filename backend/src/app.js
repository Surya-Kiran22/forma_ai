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

// Security CORS config - flexible origin matching with support for Render subdomains & wildcards
const allowedOrigins = (env.CORS_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (mobile apps, curl, postman) or dev mode or wildcard
      if (!origin || allowedOrigins.includes('*') || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      console.warn(`[CORS Blocked] Origin: ${origin}, Allowed: ${JSON.stringify(allowedOrigins)}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Serve React Frontend Production Build (Unified Single Service)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}

// Centralized error handler
app.use(errorHandler);

export default app;
