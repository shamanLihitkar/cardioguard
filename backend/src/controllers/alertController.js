import { pool } from "../config/db.js";

export const getUserAlerts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { limit = 10, page = 1 } = req.query;

    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT * FROM alerts
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, Number(limit), Number(offset)]
    );

    res.json({
      data: rows,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};