import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      `
            SELECT * FROM admin WHERE email=?
            `,
      [email]
    );
    if (!adminLogin.length) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const admin = rows[0];
    console.log(admin);

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log(admin.password, password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }
    return res.json({ message: "Login sucessfull", adminId: admin.id });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT id,name,email FROM users
            `);
    return res.json({ data: rows });
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ message: "Server error try again after sometime!" });
  }
};

export const getAllHospitals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
        SELECT id,name,email,latitude,longitude FROM hospitals
        `);
    return res.json({ data: rows });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Server error try again after sometime!" });
  }
};
export const deleteUser = async (req, res) => {
  try {
    console.log(req.params.id);

    const userId = req.params.id;
    console.log(userId);
    await pool.query(
      `
      DELETE FROM family_contacts WHERE user_id=?
      `,
      [userId]
    );
    await pool.query(
      `
            DELETE FROM users WHERE id=?
            `,
      [userId]
    );
    return res.json({ message: "User deleted" });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Could not delete user " });
  }
};

export const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `
            DELETE FROM hospitals WHERE id=?
            `,
      [id]
    );
    return res.json({ message: "Hospital deleted" });
  } catch (error) {
    console.log(error.message);
    return res.json({ message: "Could not delete hospital at the moment!" });
  }
};
