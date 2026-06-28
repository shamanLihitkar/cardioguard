import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { handleSocket, initSocket } from "./sockets/socketHandler.js";
import { vitalsQueue } from "./queue/vitalsQueue.js";

import { initDB } from "../scripts/dbInit.js";
import { initTables } from "../scripts/tablesInit.js";

import authRoutes from "./routes/authRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";

dotenv.config();

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "cardioguard-c72t55hct-shamanlihitkar-8432s-projects.vercel.app",
      "cardioguard-delta.vercel.app",
    ],
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/alerts", alertRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/admin", adminRoutes);
app.use("/api", otpRoutes);

// ✅ HTTP server
const server = http.createServer(app);

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // OK for testing
  },
});

// Initialize sockets
initSocket(io);
handleSocket(io);

// 🚀 UPDATED VITALS ROUTE (IMPORTANT)
app.post("/vitals", async (req, res) => {
  try {
    const data = req.body;

    console.log("📡 REST vitals received:", data);

    await vitalsQueue.add("processVitals", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    res.status(200).json({ message: "Vitals queued" });

  } catch (err) {
    console.error("❌ Queue error:", err);
    res.status(500).json({ error: "Failed to queue vitals" });
  }
});

// ✅ Health check (useful for testing)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;

// 🚀 Start server
const startServer = async () => {
  try {
    console.log("⚙️ Initializing database...");

    await initDB();
    await initTables();

    console.log("✅ Database & Tables ready");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
};

startServer();