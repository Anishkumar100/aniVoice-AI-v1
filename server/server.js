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

// CORS first
// CORS first
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://anivoice-ai-v1.vercel.app',           // ✅ NO trailing slash
    'https://anivoice-ai-v1-*.vercel.app'          // ✅ Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



// Character routes BEFORE express.json() (no debug middleware!)


// NOW add JSON body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Other routes
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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server spinning on port ${PORT}`));
