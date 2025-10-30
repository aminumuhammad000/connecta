// src/core/utils/socketIO.ts
import { Server } from 'socket.io';
let io: Server | null = null;

export const setIO = (ioInstance: Server) => {
  io = ioInstance;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io instance not set');
  return io;
};