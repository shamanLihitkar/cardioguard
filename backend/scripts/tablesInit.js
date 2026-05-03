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
      email VARCHAR(100),
      password VARCHAR(255)
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
  await connection.query(`
    CREATE TABLE IF NOT EXISTS hospitals(
      id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);
  await connection.query(`
      CREATE TABLE IF NOT EXISTS hospital_alerts(
       id INT AUTO_INCREMENT PRIMARY KEY,

    hospital_id INT NOT NULL,
    user_id INT NOT NULL,
    patient_name VARCHAR(255),
    latitude DOUBLE,
    longitude DOUBLE,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT,
    email VARCHAR(255),

    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
      `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `)
      await connection.query(
        `
        CREATE TABLE IF NOT EXISTS otpTable(
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp INT,
        expires_in DATETIME NOT NULL
        ) 
        `
      );
  console.log("✅ Tables initialized");

  await connection.end();
};
