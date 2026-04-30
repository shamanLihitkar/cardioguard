import bcrypt from "bcrypt";
import {pool} from "./config/db.js";
const password="1234";
const hashedPassword=await bcrypt.hash(password,10);
const name="Ibrahim"
const email="ikapadwanchwala@gmail.com"
const latitude=18
const longitude=73
await pool.query(`
    INSERT INTO hospitals(name,email,password,latitude,longitude) VALUES(?,?,?,?,?)
    `,[name,email,hashedPassword,latitude,longitude]);
    console.log("Hospital added");
    