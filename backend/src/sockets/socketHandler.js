// sockets/socketHandler.js

import { vitalsQueue } from "../queue/vitalsQueue.js";

let ioInstance = null;

// 🔥 Initialize socket (called from server.js)
export const initSocket = (io) => {
  ioInstance = io;
};

// 🔥 Get socket instance (used in worker)
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
};

export const handleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    // 🏥 Hospital joins room
    socket.on("join_hospital", (hospitalId) => {
      socket.join(`hospital_${hospitalId}`);
      console.log(`🏥 Hospital ${hospitalId} joined`);
    });

    // 👤 User joins room (optional but good)
    socket.on("join_user", (userId) => {
      socket.join(`user_${userId}`);
    });

    // 📡 Vitals stream
    socket.on("vitals", async (data) => {
      try {
        console.log("📡 Received vitals:", data);

        await vitalsQueue.add("processVitals", data);

        // ✅ send back only to sender
        socket.emit("liveVitals", data);

      } catch (err) {
        console.error("❌ Queue error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};