import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import characterRoutes from "./routes/characterRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import voiceRoutes from "./routes/voiceRoutes.js";
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import connectDB from './config/db.js';
import conversationRoutes from './routes/conversationRoutes.js';

dotenv.config();
const app = express();

connectDB();

// Allowed origins list (function handles wildcard for Vercel previews)
const allowedOrigins = [
  'http://localhost:3000',
  'https://anivoice-ai-v1.vercel.app',
];

function checkOrigin(origin, callback) {
  // Allow requests with no origin (mobile apps, Postman, server-to-server)
  if (!origin) return callback(null, true);
  // Exact match
  if (allowedOrigins.includes(origin)) return callback(null, true);
  // Vercel preview deployments (e.g. anivoice-ai-v1-abc123.vercel.app)
  if (/^https:\/\/anivoice-ai-v1-[\w-]+\.vercel\.app$/.test(origin)) {
    return callback(null, true);
  }
  callback(new Error('Not allowed by CORS'));
}

// CORS middleware
app.use(cors({
  origin: checkOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicit preflight handler for Express 5 compatibility
app.options('*', cors({
  origin: checkOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.send('AniVoice AI is running...');
});
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/model", chatRoutes);
app.use("/api/voice", voiceRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/conversations', conversationRoutes);

// Global error handler — ensures CORS headers are present even on errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server spinning on port ${PORT}`));
