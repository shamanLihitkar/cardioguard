import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

import { sendAlertEmail } from "../services/notificationService.js";
import { getEmailsForUser } from "../services/userService.js";
import { saveAlert } from "../services/alertDbService.js";

import { findNearestHospital } from "../services/hospitalService.js";
import { saveHospitalAlert } from "../services/hospitalAlertService.js";
import { pool } from "../config/db.js";

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

const worker = new Worker(
  "vitalsQueue",
  async (job) => {
    console.time(`job-${job.id}`);

    try {
      const { userId, heartRate, spo2, lat, lng } = job.data;

      console.log("⚙️ Processing job:", job.id);

      const vitalsKey = `user:${userId}:vitals`;
      const alertKey = `alert:${userId}`;

      // 🧠 Store readings
      await connection.lpush(
        vitalsKey,
        JSON.stringify({
          heartRate,
          spo2,
          time: Date.now(),
        })
      );

      await connection.ltrim(vitalsKey, 0, 3);

      const readings = await connection.lrange(vitalsKey, 0, 3);
      const parsed = readings.map((r) => JSON.parse(r));

      const isCritical =
        parsed.length === 4 &&
        parsed.every((r) => r.heartRate === 0);

      const isHighHR =
        parsed.length === 4 &&
        parsed.every((r) => r.heartRate > 150);

      const lastAlert = await connection.get(alertKey);
      const now = Date.now();
      const COOLDOWN = 30000;

      if (isCritical || isHighHR) {
        if (!lastAlert || now - lastAlert > COOLDOWN) {
          let alertType = "";
          let hospital = null;

          if (isCritical) {
            alertType = "CRITICAL";

            const [users] = await pool.query(
              "SELECT name FROM users WHERE id = ?",
              [userId]
            );

            const patientName = users[0]?.name || "Patient";

            hospital = await findNearestHospital(lat, lng);

            if (hospital) {
              await saveHospitalAlert({
                hospitalId: hospital.id,
                userId,
                type: "CRITICAL",
                message: "Emergency: Heart rate is 0",
                lat,
                lng,
                heartRate,
                spo2,
              });

              // 🔥 EMAIL TO HOSPITAL (safe)
              try {
                await sendAlertEmail({
                  to: hospital.email,
                  type: "CRITICAL_HOSPITAL",
                  patientName,
                  hospitalName: hospital.name,
                  hospitalLat: hospital.latitude,
                  hospitalLng: hospital.longitude,
                  heartRate,
                  spo2,
                  lat,
                  lng,
                });
              } catch (err) {
                console.error("❌ Hospital email failed:", err.message);
              }
            }
          }

          if (isHighHR) {
            alertType = "HIGH_HEART_RATE";
          }

          await connection.set(alertKey, now);

          // 📧 FAMILY EMAILS (safe + parallel)
          const emails = await getEmailsForUser(userId);

          if (!emails || emails.length === 0) {
            console.log("⚠️ No emails found for user:", userId);
          } else {
            await Promise.all(
              emails.map(async (email) => {
                try {
                  await sendAlertEmail({
                    to: email,
                    userId,
                    heartRate,
                    spo2,
                    lat,
                    lng,
                    type: alertType,
                  });
                } catch (err) {
                  console.error("❌ Email failed:", err.message);
                }
              })
            );
          }

          // 💾 Save alert
          await saveAlert({
            userId,
            heartRate,
            spo2,
            lat,
            lng,
            type: alertType,
          });

          console.log("✅ Alert processed");
        }
      }

    } catch (err) {
      console.error("🔥 Worker error:", err);
    }

    console.timeEnd(`job-${job.id}`);
  },
  {
    connection,
    concurrency: 10, // 🔥 THIS IS THE KEY CHANGE
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

console.log("🚀 Worker started with concurrency...");