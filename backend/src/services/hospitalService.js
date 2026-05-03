import { pool } from "../config/db.js";

export const findNearestHospital = async (
  userLat,
  userLng,
  excludeHospitalId = null
) => {
  try {
    console.log(excludeHospitalId);
    
    let query = `
      SELECT 
        id,
        name,
        email,
        latitude,
        longitude,
        (
          6371 * acos(
            LEAST(1,
              cos(radians(?)) *
              cos(radians(latitude)) *
              cos(radians(longitude) - radians(?)) +
              sin(radians(?)) *
              sin(radians(latitude))
            )
          )
        ) AS distance
      FROM hospitals
    `;

    const params = [userLat, userLng, userLat];

    // 🔥 ONLY add WHERE if exclude exists
    if (excludeHospitalId !== null && excludeHospitalId !== undefined) {
      query += ` WHERE id != ?`;
      params.push(excludeHospitalId);
    }

    query += ` ORDER BY distance ASC LIMIT 1`;

    const [rows] = await pool.query(query, params);

    if (!rows.length) {
      console.log("❌ No hospitals found");
      return null;
    }

    console.log("🏥 Found hospital:", rows[0]);

    return rows[0];
  } catch (err) {
    console.error("❌ findNearestHospital error:", err);
    return null;
  }
};