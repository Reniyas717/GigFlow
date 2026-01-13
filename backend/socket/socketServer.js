import { Server } from 'socket.io';

export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST']
        }
    });

    // Track connected users
    const connectedUsers = new Map();

    io.on('connection', (socket) => {
        console.log('✅ Client connected:', socket.id);

        // Store user ID when they connect
        socket.on('register', (userId) => {
            connectedUsers.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        socket.on('disconnect', () => {
            // Remove user from connected users
            for (const [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
            console.log('❌ Client disconnected:', socket.id);
        });
    });

    // Helper function to emit to specific user
    io.emitToUser = (userId, event, data) => {
        const socketId = connectedUsers.get(userId);
        if (socketId) {
            io.to(socketId).emit(event, data);
        }
    };

    return io;
};
