import { pool } from "../config/db.js";

export const saveAlert = async ({
  userId,
  heartRate,
  spo2,
  lat,
  lng,
}) => {
  await pool.query(
    `INSERT INTO alerts (user_id, heart_rate, spo2, lat, lng)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, heartRate, spo2, lat, lng]
  );

  console.log("💾 Alert stored in DB");
};