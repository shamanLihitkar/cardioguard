import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const generateOtp = async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log(role);

    if (role == "user") {
      const [rows] = await pool.query(
        `SELECT email FROM users WHERE email=?`,
        [email]
      );
      if (rows.length == 0) {
        return res.status(404).json({ message: "User does not exists" });
      }
    } else if (role == "hospital") {
      const [rows] = await pool.query(
        `SELECT email FROM hospitals WHERE email=?`,
        [email]
      );
      if (rows.length == 0) {
        return res.status(404).json({ message: "User does not exists" });
      }
    } else {
      const [rows] = await pool.query(
        `SELECT email FROM admin WHERE email=?`,
        [email]
      );
      if (rows.length == 0) {
        return res.status(404).json({ message: "User does not exists" });
      }
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    await pool.query(
      `INSERT INTO otpTable(email,otp,expires_in) 
       VALUES(?,?,DATE_ADD(NOW(),INTERVAL 5 MINUTE))`,
      [email, otp]
    );

    // ✅ Resend email
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset Verification Code",
      html: `
        <p>Your OTP for resetting your password is:</p>
        <h2>${otp}</h2>
        <p>This code is valid for 5 minutes.</p>
      `,
    });

    return res.status(200).json({ message: "success" });

  } catch (error) {
    console.error("Email error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [rows] = await pool.query(
      `SELECT otp FROM otpTable WHERE email=?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const dbOtp = rows[0].otp;

    if (dbOtp == otp) {
      await pool.query(`DELETE FROM otpTable WHERE email=?`, [email]);
      return res.json({ message: "Success" });
    }

    return res.json({ message: "Failed" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password missing" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role == "user") {
      const [rows] = await pool.query(
        `SELECT email FROM users WHERE email=?`,
        [email]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      await pool.query(
        `UPDATE users SET password=? WHERE email=?`,
        [hashedPassword, email]
      );

    } else if (role == "hospital") {
      const [rows] = await pool.query(
        `SELECT email FROM hospitals WHERE email=?`,
        [email]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Hospital not found" });
      }

      await pool.query(
        `UPDATE hospitals SET password=? WHERE email=?`,
        [hashedPassword, email]
      );

    } else {
      const [rows] = await pool.query(
        `SELECT email FROM admin WHERE email=?`,
        [email]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      await pool.query(
        `UPDATE admin SET password=? WHERE email=?`,
        [hashedPassword, email]
      );
    }

    return res.status(200).json({ message: "Success" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};