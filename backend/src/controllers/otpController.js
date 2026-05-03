import { pool } from "../config/db.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
export const generateOtp = async (req, res) => {
  try {
    const { email,role } = req.body;
    console.log(role);
    
    if(role=="user"){
      const [rows] = await pool.query(
      `
            SELECT email FROM users WHERE email=?
            `,
      [email]
    );
    if (rows.length == 0) {
      return res.status(404).json({ message: "User does not exists" });
    }
    }else if(role=="hospital"){
      const [rows] = await pool.query(
      `
            SELECT email FROM hospitals WHERE email=?
            `,
      [email]
    );
    if (rows.length == 0) {
      return res.status(404).json({ message: "User does not exists" });
    }
    }else{
      const [rows] = await pool.query(
      `
            SELECT email FROM admin WHERE email=?
            `,
      [email]
    );
    if (rows.length == 0) {
      return res.status(404).json({ message: "User does not exists" });
    }
    }
    const otp = Math.floor(1000 + Math.random() * 9000);

    await pool.query(
      `
            INSERT INTO otpTable(email,otp,expires_in) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 5 MINUTE))
            `,
      [email, otp]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        pass: process.env.EMAIL_PASS,
        user: process.env.EMAIL_USER,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Verification Code",
      text: `Your OTP for resetting your password is: ${otp}. This code is valid for 5 minutes.`,
      html: `<p>Your OTP for resetting your password is: <b>${otp}</b></p><p>This code is valid for 5 minutes.</p>`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "sucess" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email);

    const [rows] = await pool.query(
      `
            SELECT otp FROM otpTable WHERE email=?
            `,
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const dbOtp = rows[0].otp;
    console.log("database " + dbOtp);
    console.log("frontend" + otp);

    if (dbOtp == otp) {
      await pool.query(
        `
                DELETE FROM otpTable WHERE email=?
                `,
        [email]
      );
      return res.json({ message: "Sucess" });
    }
    return res.json({ message: "Failed" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { email, password ,role} = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password missing" });
    }
    if(role=="user"){
      const [rows] = await pool.query(
      `
            SELECT email FROM users WHERE email=? 
            `,
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `
            UPDATE users SET password=? WHERE email=?
            `,
      [hashedPassword, email]
    );

    }else if(role=="hospital"){
      const [rows] = await pool.query(
      `
            SELECT email FROM hospitals WHERE email=? 
            `,
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "hospital not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `
            UPDATE hospitals SET password=? WHERE email=?
            `,
      [hashedPassword, email]
    );
    console.log("Hospitals table updated with new password");
    
    }else{
      const [rows] = await pool.query(
      `
            SELECT email FROM admin WHERE email=? 
            `,
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "admin not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `
            UPDATE admin SET password=? WHERE email=?
            `,
      [hashedPassword, email]
    );
    }
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
