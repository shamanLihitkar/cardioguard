import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAlertEmail = async ({
  to,
  userId,
  heartRate,
  spo2,
  lat,
  lng,
  type = "CRITICAL",
  patientName,
  hospitalName,
  hospitalLat,
  hospitalLng,
}) => {
  try {
    let subject = "";
    let html = "";

    // ================================
    // 🚨 USER / FAMILY ALERT
    // ================================
    if (type === "CRITICAL" || type === "HIGH_HEART_RATE") {
      const [users] = await pool.query(
        "SELECT name FROM users WHERE id = ?",
        [userId]
      );

      const user = users[0];
      const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

      subject =
        type === "CRITICAL"
          ? "🚨 Emergency Health Alert"
          : "⚠️ High Heart Rate Warning";

      html = `
        <h2>${subject}</h2>
        <p><strong>Patient:</strong> ${user.name}</p>
        <p><strong>Heart Rate:</strong> ${heartRate}</p>
        <p><strong>SpO2:</strong> ${spo2}</p>

        <p>
          📍 <a href="${locationLink}">View Location</a>
        </p>
      `;
    }

    // ================================
    // 🏥 HOSPITAL ALERT
    // ================================
    if (type === "CRITICAL_HOSPITAL") {
      const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

      subject = "🚨 Emergency Patient Incoming";

      html = `
        <h2>🚨 Emergency Case</h2>

        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Heart Rate:</strong> ${heartRate}</p>
        <p><strong>SpO2:</strong> ${spo2}</p>

        <p>
          📍 <a href="${locationLink}">
            Patient Location
          </a>
        </p>

        <p style="color:red;">
          Immediate attention required.
        </p>
      `;
    }

    // ================================
    // 🏥 ACCEPT EMAIL
    // ================================
    if (type === "HOSPITAL_ACCEPTED") {
      const locationLink = `https://maps.google.com/?q=${hospitalLat},${hospitalLng}`;

      subject = "🚑 Patient Admitted";

      html = `
        <h2>Patient Admitted</h2>

        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Hospital:</strong> ${hospitalName}</p>

        <p>
          📍 <a href="${locationLink}">
            Hospital Location
          </a>
        </p>
      `;
    }

    // ✅ Send using Resend
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent → ${to} (${type})`);

  } catch (err) {
    console.error("❌ Email error:", err.message);
    // ❗ DO NOT throw → prevents worker crash
  }
};