import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const userSocketMap = {}; // {userId: socketId}
const activeCallsMap = {}; // {oderId: calleeId} - tracks active calls

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Check if user is in an active call
function isUserInCall(userId) {
  return activeCallsMap[userId] || Object.values(activeCallsMap).includes(userId);
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ============ VIDEO CALL SIGNALING EVENTS ============

  // Initiate a call
  socket.on("call:initiate", ({ calleeId, caller }) => {
    const calleeSocketId = userSocketMap[calleeId];

    if (!calleeSocketId) {
      socket.emit("call:error", { message: "User is offline" });
      return;
    }

    if (isUserInCall(calleeId)) {
      socket.emit("call:busy", { calleeId });
      return;
    }

    // Mark both users as in a call
    activeCallsMap[userId] = calleeId;

    io.to(calleeSocketId).emit("call:incoming", { caller });
  });

  // Accept a call
  socket.on("call:accept", ({ callerId }) => {
    const callerSocketId = userSocketMap[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:accepted", { calleeId: userId });
    }
  });

  // Reject a call
  socket.on("call:reject", ({ callerId }) => {
    const callerSocketId = userSocketMap[callerId];

    // Remove from active calls
    delete activeCallsMap[callerId];

    if (callerSocketId) {
      io.to(callerSocketId).emit("call:rejected", { calleeId: userId });
    }
  });

  // End a call
  socket.on("call:end", ({ remoteUserId }) => {
    const remoteSocketId = userSocketMap[remoteUserId];

    // Clean up active calls for both users
    delete activeCallsMap[userId];
    delete activeCallsMap[remoteUserId];

    if (remoteSocketId) {
      io.to(remoteSocketId).emit("call:ended", { userId });
    }
  });

  // WebRTC Offer
  socket.on("call:offer", ({ offer, calleeId }) => {
    const calleeSocketId = userSocketMap[calleeId];
    if (calleeSocketId) {
      io.to(calleeSocketId).emit("call:offer", { offer, callerId: userId });
    }
  });

  // WebRTC Answer
  socket.on("call:answer", ({ answer, callerId }) => {
    const callerSocketId = userSocketMap[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("call:answer", { answer, calleeId: userId });
    }
  });

  // ICE Candidate
  socket.on("call:ice-candidate", ({ candidate, remoteUserId }) => {
    const remoteSocketId = userSocketMap[remoteUserId];
    if (remoteSocketId) {
      io.to(remoteSocketId).emit("call:ice-candidate", { candidate, userId });
    }
  });

  // ============ END VIDEO CALL SIGNALING ============

  socket.on("disconnect", () => {
    if (userId) {
      // Clean up any active calls when user disconnects
      const calleeId = activeCallsMap[userId];
      if (calleeId) {
        const calleeSocketId = userSocketMap[calleeId];
        if (calleeSocketId) {
          io.to(calleeSocketId).emit("call:ended", { userId, reason: "disconnected" });
        }
        delete activeCallsMap[userId];
      }

      // Also check if this user was a callee
      for (const [callerId, cId] of Object.entries(activeCallsMap)) {
        if (cId === userId) {
          const callerSocketId = userSocketMap[callerId];
          if (callerSocketId) {
            io.to(callerSocketId).emit("call:ended", { userId, reason: "disconnected" });
          }
          delete activeCallsMap[callerId];
        }
      }

      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
