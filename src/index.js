// At the top of your index.js
import dotenv from "dotenv";
dotenv.config({ path: './.env' });
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";

app.get('/', (req,res)=>{
     res.send("working");
})
app.listen(process.env.PORT)
connectDB()