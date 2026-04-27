import { pool } from "../config/db.js";

export const getEmailsForUser = async (userId) => {
  // get user email
  const [userRows] = await pool.query(
    "SELECT email FROM users WHERE id = ?",
    [userId]
  );

  // get family emails
  const [familyRows] = await pool.query(
    "SELECT email FROM family_contacts WHERE user_id = ?",
    [userId]
  );

  const emails = [];

  if (userRows.length > 0) {
    emails.push(userRows[0].email);
  }

  familyRows.forEach((row) => {
    emails.push(row.email);
  });

  return emails;
};