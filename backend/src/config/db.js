import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 FORCE correct path to .env
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// 🔍 DEBUG (REMOVE LATER)
console.log("DB ENV:", {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
});

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});