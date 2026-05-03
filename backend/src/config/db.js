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



export const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
