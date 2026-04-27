import { vitalsQueue } from "../queue/vitalsQueue.js";

export const handleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("vitals", async (data) => {
      try {
        console.log("Received vitals:", data);

        // ✅ Push to queue instead of processing
        await vitalsQueue.add("processVitals", data);

        // still send to frontend
        io.emit("liveVitals", data);

      } catch (err) {
        console.error("Queue error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};