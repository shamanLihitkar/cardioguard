import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import { handleSocket, initSocket } from "./sockets/socketHandler.js";

import { initDB } from "../scripts/dbInit.js";
import { initTables } from "../scripts/tablesInit.js";

import authRoutes from "./routes/authRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import otpRoutes from "./routes/otpRoutes.js"
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/auth", authRoutes);
app.use("/alerts", alertRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/admin", adminRoutes);
app.use('/api',otpRoutes);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 IMPORTANT FIX
initSocket(io);

// existing
handleSocket(io);

app.post("/vitals", (req, res) => {
  console.log("REST vitals:", req.body);
  res.send("Ok");
});

const PORT = process.env.PORT || 5000;

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