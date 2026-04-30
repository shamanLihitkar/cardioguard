// services/hospitalService.js

import {pool} from "../config/db.js";

/**
 * Find nearest hospital using Haversine formula (SQL)
 */


/**
 * Find nearest hospital using Haversine formula (SQL)
 */
export async function findNearestHospital(userLat, userLng) {
  try {
    // 🔴 Guard: missing location
    if (userLat == null || userLng == null) {
      console.log("⚠️ User location missing");
      return null;
    }

    const query = `
      SELECT 
        id,
        name,
        email,
        latitude,
        longitude,
        (
          6371 * acos(
            cos(radians(?)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) +
            sin(radians(?)) *
            sin(radians(latitude))
          )
        ) AS distance
      FROM hospitals
      HAVING distance IS NOT NULL
      ORDER BY distance ASC
      LIMIT 1;
    `;

    const [rows] = await pool.query(query, [
      userLat,
      userLng,
      userLat,
    ]);

    if (!rows.length) {
      console.log("❌ No hospitals found");
      return null;
    }

    return rows[0];

  } catch (error) {
    console.error("❌ Error in findNearestHospital:", error);
    throw error;
  }
}

