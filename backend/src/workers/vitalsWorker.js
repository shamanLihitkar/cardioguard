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

      const isCritical =
        parsed.length === 4 &&
        parsed.every((r) => r.heartRate === 0);

      const isHighHR =
        parsed.length === 4 &&
        parsed.every((r) => r.heartRate > 150);

      const lastAlert = await connection.get(alertKey);
      const now = Date.now();
      const COOLDOWN = 30000;
      console.log(isCritical);
      
      if (isCritical || isHighHR) {
        if (!lastAlert || now - lastAlert > COOLDOWN) {

          let alertType = "";
          let hospital = null;
          console.log("above critical flow");
          
          // 🚨 CRITICAL FLOW
          if (isCritical) {
            console.log("in critical flow");
            alertType = "CRITICAL";

            // 🔍 Get patient name
            const [users] = await pool.query(
              "SELECT name FROM users WHERE id = ?",
              [userId]
            );
            const patientName = users[0]?.name || "Patient";

            hospital = await findNearestHospital(lat, lng);
            console.log("Hospital object: "+ hospital);
            
            if (hospital) {
              await saveHospitalAlert({
                hospitalId: hospital.id,
                userId,
                type: "CRITICAL",
                message: "Emergency: Heart rate is 0",
                lat,
                lng,
                heartRate,
                spo2
              });

              console.log("🏥 Alert saved for hospital:", hospital.name);

              // 🔥 EMAIL TO HOSPITAL
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

              console.log("📧 Hospital notified:", hospital.email);
            }
          }

          if (isHighHR) {
            alertType = "HIGH_HEART_RATE";
          }

          await connection.set(alertKey, now);

          // 📧 FAMILY + USER EMAILS
          const emails = await getEmailsForUser(userId);

          if(!emails || emails.length === 0) {
            console.log("⚠️ No emails found for user:", userId);  }else{
              await Promise.all(
            emails.map((email) =>
              sendAlertEmail({
                to: email,
                userId,
                heartRate,
                spo2,
                lat,
                lng,
                type: alertType,
              })
            )
          );
            }

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