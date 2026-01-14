import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { initializeSocket } from './socket/socketServer.js';
import authRoutes from './routes/authRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import {Server} from 'socket.io';
dotenv.config();

const app = express();
const httpServer = createServer(app);

connectDB();

// Initialize Socket.io
export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ['https://gigflow-reniyas.vercel.app', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST']
    }
  });
  return io;
}
const io=initializeSocket(httpServer);


// Make io available to routes
app.set('io', io);

app.use(cors({
  origin: ['https://gigflow-reniyas.vercel.app','http://localhost:5173'], 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready`);
});
