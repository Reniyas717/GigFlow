import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id);
                // Register user with their ID for targeted notifications
                newSocket.emit('register', user.id);
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            setSocket(newSocket);

            return () => {
                console.log('Closing socket connection');
                newSocket.close();
            };
        } else if (socket) {
            socket.close();
            setSocket(null);
        }
    }, [isAuthenticated, user?.id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
