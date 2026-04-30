// controllers/hospitalController.js

import {pool} from "../config/db.js";
import bcrypt from "bcrypt";
import {getEmailsForUser}from "../services/userService.js"
import {sendAlertEmail}from "../services/notificationService.js"
export const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM hospitals WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const hospital = rows[0];

   
    if (!bcrypt.compare(hospital.password,password)) {
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
export const registerHospital = async (req, res) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    // 🔍 1. Validate input
    if (!name || !email || !password || !latitude || !longitude) {
      return res.status(400).json({
        message: "All fields (name, email, password, latitude, longitude) are required",
      });
    }

    // 🔍 2. Check if hospital already exists
    const [existing] = await pool.query(
      "SELECT id FROM hospitals WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Hospital already registered with this email",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 3. Insert hospital
    const [result] = await pool.query(
      `INSERT INTO hospitals 
       (name, email, password, latitude, longitude)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, latitude, longitude]
    );

    // ✅ 4. Success response
    return res.status(201).json({
      message: "Hospital registered successfully",
      hospitalId: result.insertId,
    });

  } catch (err) {
    console.error("❌ Error in registerHospital:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
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
        email

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

export const updateHospitalAlertStatus = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status } = req.body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 🔍 Get alert + hospital + user details
    const [rows] = await pool.query(
      `
      SELECT 
        ha.id,
        ha.user_id,
        ha.patient_name,
        ha.latitude,
        ha.longitude,
        h.name AS hospital_name,
        h.latitude AS hospital_lat,
        h.longitude AS hospital_lng
      FROM hospital_alerts ha
      JOIN hospitals h ON ha.hospital_id = h.id
      WHERE ha.id = ?
      `,
      [alertId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Alert not found" });
    }

    const alert = rows[0];

    // 🔥 Update ONLY if still pending
    const [result] = await pool.query(
      `
      UPDATE hospital_alerts
      SET status = ?
      WHERE id = ? AND status = 'PENDING'
      `,
      [status, alertId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Already processed",
      });
    }

    // 📧 SEND EMAIL ONLY IF ACCEPTED
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

    res.json({ message: "Status updated" });

  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  }
};