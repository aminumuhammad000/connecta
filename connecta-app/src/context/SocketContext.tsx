import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../utils/constants';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];
    unreadCount: number;
    unreadNotificationCount: number;
    refreshUnreadCount: () => Promise<void>;
    refreshUnreadNotificationCount: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    // Function to fetch unread message count
    const refreshUnreadCount = async () => {
        if (user?._id) {
            try {
                const { getTotalUnreadCount } = require('../services/messageService');
                const count = await getTotalUnreadCount(user._id);
                setUnreadCount(count);
            } catch (error) {
                console.error('[Socket] Failed to fetch unread count:', error);
            }
        }
    };

    // Function to fetch unread notification count
    const refreshUnreadNotificationCount = async () => {
        if (user?._id) {
            try {
                const { getUnreadCount } = require('../services/notificationService');
                const count = await getUnreadCount();
                setUnreadNotificationCount(count);
            } catch (error) {
                console.error('[Socket] Failed to fetch unread notification count:', error);
            }
        }
    };

    useEffect(() => {
        if (!user || !token || !API_BASE_URL) {
            if (!API_BASE_URL && user && token) {
                console.warn('[Socket] API_BASE_URL is not defined, skipping socket initialization');
            }
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        console.log('[Socket] Connecting to:', API_BASE_URL);
        const socketInstance = io(API_BASE_URL, {
            auth: {
                token: token,
                userId: user._id
            },
            transports: ['polling'], // Force polling for better stability on emulator
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
            socketInstance.emit('user:join', user._id);
            refreshUnreadCount();
            refreshUnreadNotificationCount();
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        socketInstance.on('user:online', (data: { userId: string }) => {
            setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
        });

        socketInstance.on('user:offline', (data: { userId: string }) => {
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        });

        // Message events
        socketInstance.on('message:receive', () => {
            refreshUnreadCount();
        });

        socketInstance.on('conversation:update', () => {
            refreshUnreadCount();
        });

        socketInstance.on('message:read', () => {
            refreshUnreadCount();
        });

        // Notification events
        socketInstance.on('notification:new', () => {
            refreshUnreadNotificationCount();
        });

        socketInstance.on('notification:read', () => {
            refreshUnreadNotificationCount();
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user, token]);

    // Initial fetch when user changes
    useEffect(() => {
        if (user?._id) {
            refreshUnreadCount();
            refreshUnreadNotificationCount();
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            onlineUsers,
            unreadCount,
            unreadNotificationCount,
            refreshUnreadCount,
            refreshUnreadNotificationCount
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
