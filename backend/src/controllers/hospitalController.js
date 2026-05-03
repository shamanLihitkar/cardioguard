// controllers/hospitalController.js

import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

import { getEmailsForUser } from "../services/userService.js";
import { sendAlertEmail } from "../services/notificationService.js";
import { findNearestHospital } from "../services/hospitalService.js";
import { saveHospitalAlert } from "../services/hospitalAlertService.js";

import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
 
const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// 🔥 HELPER: Get latest vitals safely
const getLatestVitals = async (userId) => {
  try {
    const key = `user:${userId}:vitals`;
    const readings = await redis.lrange(key, 0, 0);

    console.log("🧠 Redis readings:", readings);

    if (!readings.length) {
      return { heartRate: null, spo2: null };
    }

    const latest = JSON.parse(readings[0]);

    return {
      heartRate: latest.heartRate,
      spo2: latest.spo2,
    };
  } catch (err) {
    console.error("❌ Error fetching vitals:", err);
    return { heartRate: null, spo2: null };
  }
};

// =============================
// 🔐 LOGIN
// =============================
export const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM hospitals WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const hospital = rows[0];

    const isMatch = await bcrypt.compare(password, hospital.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Login successful",
      hospitalId: hospital.id,
      name: hospital.name,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 🏥 REGISTER
// =============================
export const registerHospital = async (req, res) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    if (!name || !email || !password || !latitude || !longitude) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM hospitals WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Hospital already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO hospitals 
       (name, email, password, latitude, longitude)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, latitude, longitude]
    );

    return res.status(201).json({
      message: "Hospital registered",
      hospitalId: result.insertId,
    });

  } catch (err) {
    console.error("❌ registerHospital error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// 📋 GET ALERTS
// =============================
export const getHospitalAlerts = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        alert_type,
        message,
        status,
        created_at,
        patient_name,
        latitude,
        longitude,
        email,
        user_id
      FROM hospital_alerts
      WHERE hospital_id = ?
      ORDER BY created_at DESC
      `,
      [hospitalId]
    );

    res.json(rows);

  } catch (err) {
    console.error("❌ Error fetching alerts:", err);
    res.status(500).json({ message: "Error fetching alerts" });
  }
};

// =============================
// 🔄 UPDATE STATUS + REASSIGN
// =============================
export const updateHospitalAlertStatus = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { alertId } = req.params;
    const { status } = req.body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT 
        ha.*,
        h.name AS hospital_name,
        h.latitude AS hospital_lat,
        h.longitude AS hospital_lng,
        h.email AS hospital_email
      FROM hospital_alerts ha
      JOIN hospitals h ON ha.hospital_id = h.id
      WHERE ha.id = ?
      FOR UPDATE
      `,
      [alertId]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Alert not found" });
    }

    const alert = rows[0];

    const [result] = await connection.query(
      `
      UPDATE hospital_alerts
      SET status = ?
      WHERE id = ? AND status = 'PENDING'
      `,
      [status, alertId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Already processed" });
    }

    // =============================
    // ✅ ACCEPT FLOW
    // =============================
    if (status === "ACCEPTED") {
      const emails = await getEmailsForUser(alert.user_id);

      await Promise.all(
        emails.map((email) =>
          sendAlertEmail({
            to: email,
            type: "HOSPITAL_ACCEPTED",
            patientName: alert.patient_name,
            hospitalName: alert.hospital_name,
            hospitalLat: alert.hospital_lat,
            hospitalLng: alert.hospital_lng,
          })
        )
      );

      console.log("📧 Acceptance emails sent");
    }

    // =============================
    // ❌ REJECT FLOW → REASSIGN
    // =============================
    if (status === "REJECTED") {
      console.log("🔁 Reassigning alert...");

      const nextHospital = await findNearestHospital(
        alert.latitude,
        alert.longitude,
        alert.hospital_id
      );

      console.log("🏥 Next hospital:", nextHospital);

      if (nextHospital) {
        // 🔥 Get vitals
        let { heartRate, spo2 } = await getLatestVitals(alert.user_id);

        // 🔥 Fallback (IMPORTANT)
        if (heartRate == null || spo2 == null) {
          console.log("⚠️ Redis empty → using fallback values");
          heartRate = heartRate ?? 0;
          spo2 = spo2 ?? 0;
        }

        // 💾 Save alert
        await saveHospitalAlert({
          hospitalId: nextHospital.id,
          userId: alert.user_id,
          type: alert.alert_type,
          message: alert.message,
          lat: alert.latitude,
          lng: alert.longitude,
        });

        console.log("🏥 Reassigned to:", nextHospital.name);

        // 📧 Send email
        await sendAlertEmail({
          to: nextHospital.email,
          type: "CRITICAL_HOSPITAL",
          patientName: alert.patient_name,
          hospitalName: nextHospital.name,
          hospitalLat: nextHospital.latitude,
          hospitalLng: nextHospital.longitude,
          heartRate,
          spo2,
          lat: alert.latitude,
          lng: alert.longitude,
        });

        console.log("📧 Email sent to reassigned hospital:", nextHospital.email);

      } else {
        console.log("❌ No hospital available for reassignment");
      }
    }

    await connection.commit();

    res.json({ message: "Status updated successfully" });

  } catch (err) {
    await connection.rollback();
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};