import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser'

const app=express();

app.use(cors({
     origin: process.env.CORS_ORIGIN,
     credentials:true,
}))
          // FOR JSON FILE 
app.use(express.json({limit:"16kb"}));
          // FOR URLS  extended use for nested objects 
app.use(express.urlencoded({extended:true,limit:"16kb"}))
          //   TO STORE FILE OR MEDIA IN FOLDER
app.use(express.static("public"))
          // to read user cookie 
app.use(cookieParser())
