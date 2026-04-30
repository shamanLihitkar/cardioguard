import { pool } from "../config/db.js";



export async function saveHospitalAlert({
  hospitalId,
  userId,
  type,
  message,
  lat,
  lng,
}) {
  try {
    // 🔍 Fetch user name + email
    const [users] = await pool.query(
      "SELECT name, email FROM users WHERE id = ?",
      [userId]
    );

    if (!users.length) {
      console.log("❌ User not found");
      return;
    }

    const user = users[0];

    // console.log("👤 User Data:", user);

    // 🧠 Insert alert with correct mapping
    await pool.query(
      `INSERT INTO hospital_alerts 
      (hospital_id, user_id, patient_name, latitude, longitude, alert_type, message, email, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        hospitalId,
        userId,
        user.name,
        lat,
        lng,
        type,
        message,      // ✅ correct position
        user.email,   // ✅ correct position
        "PENDING",    // ✅ correct
      ]
    );

    console.log("🏥 Hospital alert saved");

  } catch (err) {
    console.error("❌ Error saving hospital alert:", err);
  }
}