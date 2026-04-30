import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🔐 REGISTER
export const register = async (req, res) => {
  try {
    
    const { name, email, password, familyMembers } = req.body;
    console.log(familyMembers);

    // check if user exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    const [
      result,
    ] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const userId = result.insertId;
    console.log(userId);
    if (!Array.isArray(familyMembers)) {
  return res.status(400).json({
    message: "familyMembers must be an array",
  });
}
    // 🔥 INSERT FAMILY CONTACTS
    if (familyMembers && familyMembers.length > 0) {
      for (const member of familyMembers) {
       
        
        if (!member.name || !member.email) {
          console.log("Invalid member:", member);
          continue;
        }

        await pool.query(
          "INSERT INTO family_contacts (user_id, name, email) VALUES (?, ?, ?)",
          [userId, member.name, member.email]
        );
      }
    }

    res.json({
      message: "User registered successfully",
      userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user" });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
};
