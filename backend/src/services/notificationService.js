import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {pool} from "../config/db.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// 🔌 Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📧 Send Alert Email


export const sendAlertEmail = async ({
  to,
  userId,
  heartRate,
  spo2,
  lat,
  lng,
  type = "CRITICAL",

  // 🏥 NEW FIELDS
  patientName,
  hospitalName,
  hospitalLat,
  hospitalLng,
}) => {
  try {
    let subject = "";
    let html = "";

    // ================================
    // 🚨 HEALTH ALERT EMAIL
    // ================================
    if (type === "CRITICAL" || type === "HIGH_HEART_RATE") {
      const [users] = await pool.query(
        "SELECT name FROM users WHERE id = ?",
        [userId]
      );

      if (!users.length) {
        console.log("❌ User not found");
        return;
      }

      const user = users[0];

      const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

      subject =
        type === "CRITICAL"
          ? "🚨 Emergency Health Alert"
          : "⚠️ High Heart Rate Warning";

      const message =
        type === "CRITICAL"
          ? "Immediate medical attention may be required."
          : "User's heart rate is consistently high.";

      html = `
        <h2>${subject}</h2>

        <p><strong>Patient Name:</strong> ${user.name}</p>
        <p><strong>Heart Rate:</strong> ${heartRate} bpm</p>
        <p><strong>SpO2:</strong> ${spo2}%</p>

        <p style="color:${
          type === "CRITICAL" ? "red" : "orange"
        }; font-weight:bold;">
          ${message}
        </p>

        <p>
          📍 <strong>Location:</strong>
          <a href="${locationLink}" target="_blank">
            View on Google Maps
          </a>
        </p>
      `;
    }

    // ================================
    // 🏥 HOSPITAL ACCEPTED EMAIL
    // ================================
    if (type === "HOSPITAL_ACCEPTED") {
      const locationLink = `https://maps.google.com/?q=${hospitalLat},${hospitalLng}`;

      subject = "🚑 Patient Admitted to Hospital";

      html = `
        <h2>🚑 Patient Accepted by Hospital</h2>

        <p><strong>Patient:</strong> ${patientName}</p>

        <p>
          🏥 <strong>Hospital:</strong> ${hospitalName}
        </p>

        <p>
          📍 <strong>Location:</strong>
          <a href="${locationLink}" target="_blank">
            View on Google Maps
          </a>
        </p>

        <p style="color:green; font-weight:bold;">
          The patient is now under medical care.
        </p>

        <hr/>
        <p style="font-size:12px;color:gray;">
          CardioGuard System Notification
        </p>
      `;
    }

    // ================================
    // 📧 SEND EMAIL
    // ================================
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent to ${to} [${type}]`);
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
};
