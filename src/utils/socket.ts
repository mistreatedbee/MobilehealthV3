import { io, Socket } from "socket.io-client";
import { API_URL } from './apiConfig';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 */
export const initSocket = (userId?: string, role?: string) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(API_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✅ Socket.IO connected:", socket?.id);

    // Join rooms based on user
    if (userId) {
      socket?.emit("join:user", userId);
      socket?.emit("join:notifications", userId);

      if (role === "doctor") {
        socket?.emit("join:doctor", userId);
      } else if (role === "patient") {
        socket?.emit("join:patient");
      } else if (role === "admin") {
        socket?.emit("join:admin");
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket.IO disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Subscribe to real-time events
 */
export const subscribeToEvent = (
  event: string,
  callback: (data: any) => void
) => {
  if (!socket) {
    console.warn("Socket not initialized");
    return () => {};
  }

  socket.on(event, callback);

  // Return unsubscribe function
  return () => {
    socket?.off(event, callback);
  };
};

/**
 * Unsubscribe from event
 */
export const unsubscribeFromEvent = (event: string) => {
  if (socket) {
    socket.off(event);
  }
};

