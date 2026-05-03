import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const initDB = async () => {

 const connection = await mysql.createConnection({
   uri: process.env.MYSQL_URL,
   ssl: {
     rejectUnauthorized: false,
   },
 });

  await connection.query("CREATE DATABASE IF NOT EXISTS cardioguard");
  console.log("✅ Database initialized");

  await connection.end();
};