import bcrypt from "bcrypt"
import {pool} from "./config/db.js";
const password="111";
const hashedPassword=await bcrypt.hash(password,10);
const email="destructorsonu@gmail.com";
await pool.query(`
    INSERT INTO admin(email,password) VALUES(?,?)
    `,[email,hashedPassword]);

    console.log("Admin added");
    