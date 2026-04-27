import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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
  type = "CRITICAL", // default
}) => {
  try {
    const locationLink = `https://maps.google.com/?q=${lat},${lng}`;

    // 🔥 Dynamic subject
    const subject =
      type === "CRITICAL"
        ? "🚨 Emergency Health Alert"
        : "⚠️ High Heart Rate Warning";

    // 🔥 Dynamic message
    const message =
      type === "CRITICAL"
        ? "Immediate medical attention may be required."
        : "User's heart rate is consistently high. Please stop activity and rest.";

    // 🔥 Email template
    const html = `
      <h2>${subject}</h2>

      <p><strong>User ID:</strong> ${userId}</p>
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

      <hr/>

      <p style="font-size:12px;color:gray;">
        This is an automated alert from CardioGuard System.
      </p>
    `;

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