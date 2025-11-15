import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

let socketInstance = null;

export const initSocket = (userId) => {
  console.log("initSocket called with userId:", userId);
  console.log("Current socketInstance:", socketInstance);

  if (!socketInstance && userId) {
    console.log("Creating new socket connection with userId:", userId);
    socketInstance = io(BASE_URL, {
      query: {
        userId: userId,
      },
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected successfully! Socket ID:", socketInstance.id);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }
  return socketInstance;
};

export const getSocket = () => {
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// For backward compatibility
export const socket = {
  connect: () => {},
  disconnect: () => disconnectSocket(),
  emit: () => {},
  on: (event, callback) => {
    if (socketInstance) socketInstance.on(event, callback);
  },
  off: (event) => {
    if (socketInstance) socketInstance.off(event);
  },
};
