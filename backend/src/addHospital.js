import bcrypt from "bcrypt";
import {pool} from "./config/db.js";
const password="11111";
const hashedPassword=await bcrypt.hash(password,10);
const name="hospital 2"
const email="kapadwanchwalai@gmail.com"
const latitude=18.742250
const longitude=73.677641
await pool.query(`
    INSERT INTO hospitals(name,email,password,latitude,longitude) VALUES(?,?,?,?,?)
    `,[name,email,hashedPassword,latitude,longitude]);
    console.log("Hospital added");
    