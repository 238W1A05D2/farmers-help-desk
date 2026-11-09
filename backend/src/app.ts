import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/index';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// .env lives at backend/.env — __dirname is backend/src, so go up 1 level
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// CORS - only allow configured frontend URL
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// API routes
app.use('/api', apiRoutes);

// 404 for unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
