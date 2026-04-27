import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

import { sendAlertEmail } from "../services/notificationService.js";
import { getEmailsForUser } from "../services/userService.js";
import { saveAlert } from "../services/alertDbService.js";

dotenv.config();

// 🔌 Redis connection
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// 🚀 Worker
const worker = new Worker(
  "vitalsQueue",
  async (job) => {
    try {
      const { userId, heartRate, spo2, lat, lng } = job.data;

      console.log("⚙️ Processing job:", job.data);

      // 🔑 Redis keys
      const vitalsKey = `user:${userId}:vitals`;
      const alertKey = `alert:${userId}`;

      // 🧠 STEP 1: Store latest reading
      await connection.lpush(
        vitalsKey,
        JSON.stringify({
          heartRate,
          spo2,
          time: Date.now(),
        })
      );

      // keep only last 4 readings (20 sec)
      await connection.ltrim(vitalsKey, 0, 3);

      // 🧠 STEP 2: Fetch last readings
      const readings = await connection.lrange(vitalsKey, 0, 3);
      const parsed = readings.map((r) => JSON.parse(r));

      console.log("🧠 Last readings:", parsed);

      // 🧠 STEP 3: Conditions

      // 🚨 CRITICAL → HR = 0
      const isCritical =
        parsed.length === 4 &&
        parsed.every((r) => r.heartRate === 0);

      // ⚠️ HIGH HR → HR > 140
      const isHighHR =
        parsed.length === 4 &&
        parsed.every((r) => r.heartRate > 150);

      // 🧠 STEP 4: Cooldown logic
      const lastAlert = await connection.get(alertKey);
      const now = Date.now();
      const COOLDOWN = 30 * 1000; // 30 sec

      if (isCritical || isHighHR) {
        if (!lastAlert || now - lastAlert > COOLDOWN) {

          let alertType = "";

          if (isCritical) {
            alertType = "CRITICAL";
            console.log(`🚨 EMERGENCY for user ${userId}`);
          }

          if (isHighHR) {
            alertType = "HIGH_HEART_RATE";
            console.log(`⚠️ High heart rate detected for user ${userId}`);
          }

          // ⏱️ Save cooldown timestamp
          await connection.set(alertKey, now);

          // 📧 Get emails
          const emails = await getEmailsForUser(userId);

          console.log("📧 Sending alert to:", emails);

          // 📧 Send emails
          for (const email of emails) {
            await sendAlertEmail({
              to: email,
              userId,
              heartRate,
              spo2,
              lat,
              lng,
              type: alertType,
            });
          }

          // 💾 Save alert in DB
          await saveAlert({
            userId,
            heartRate,
            spo2,
            lat,
            lng,
            type: alertType,
          });

          console.log("✅ Alert processed successfully");

        } else {
          console.log("⏳ Cooldown active, skipping alert");
        }
      }

    } catch (err) {
      console.error("🔥 Worker error:", err);
      throw err; // important for retry
    }
  },
  { connection }
);

// 📊 Logs
worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

console.log("🚀 Worker started...");