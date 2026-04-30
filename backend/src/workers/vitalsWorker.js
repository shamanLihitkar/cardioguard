import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

import { sendAlertEmail } from "../services/notificationService.js";
import { getEmailsForUser } from "../services/userService.js";
import { saveAlert } from "../services/alertDbService.js";

import { findNearestHospital } from "../services/hospitalService.js";
import { saveHospitalAlert } from "../services/hospitalAlertService.js";

dotenv.config();

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "vitalsQueue",
  async (job) => {
    try {
      const { userId, heartRate, spo2, lat, lng } = job.data;

      console.log("⚙️ Processing job:", job.data);

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

      // 🚨 Conditions
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

          // 🚨 CRITICAL FLOW
          if (isCritical) {
            alertType = "CRITICAL";
            console.log(`🚨 EMERGENCY for user ${userId}`);

            hospital = await findNearestHospital(lat, lng);

            if (hospital) {
              await saveHospitalAlert({
                hospitalId: hospital.id,
                userId,
                type: "CRITICAL",
                message: "Emergency: Heart rate is 0",
                lat,
                lng,
              });

              console.log("🏥 Alert saved for hospital:", hospital.id);
            }
          }

          // ⚠️ HIGH HR FLOW
          if (isHighHR) {
            alertType = "HIGH_HEART_RATE";
          }

          // ⏱️ Cooldown
          await connection.set(alertKey, now);

          // 📧 Emails
          const emails = await getEmailsForUser(userId);

          await Promise.all([
            ...emails.map((email) =>
              sendAlertEmail({
                to: email,
                userId,
                heartRate,
                spo2,
                lat,
                lng,
                type: alertType,
              })
            ),
            alertType === "CRITICAL" && hospital
              ? sendAlertEmail({
                  to: hospital.email,
                  userId,
                  heartRate,
                  spo2,
                  lat,
                  lng,
                  type: "CRITICAL_HOSPITAL",
                })
              : null,
          ]);

          // 💾 Save general alert
          await saveAlert({
            userId,
            heartRate,
            spo2,
            lat,
            lng,
            type: alertType,
          });

          console.log("✅ Alert processed");
        } else {
          console.log("⏳ Cooldown active");
        }
      }

    } catch (err) {
      console.error("🔥 Worker error:", err);
      throw err;
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

console.log("🚀 Worker started...");