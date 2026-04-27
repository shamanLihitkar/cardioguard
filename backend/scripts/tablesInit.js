import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const initTables = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASS,
    database: "cardioguard",
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100),
      email VARCHAR(100)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS family_contacts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      name VARCHAR(100),
      email VARCHAR(100),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      heart_rate INT,
      spo2 INT,
      lat DOUBLE,
      lng DOUBLE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Tables initialized");

  await connection.end();
};