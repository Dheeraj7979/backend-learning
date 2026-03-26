import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import APIErrorHandler from "../utils/APIErrorHandler.js";
import jwt from "jsonwebtoken"

 export const verifyJWT = asyncHandler(async function(req,res,next){
     const token = req.cookies?.accessToken

     if(!token){
          throw new APIErrorHandler(401,"Unauthorized access");
     }
     
    const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     
    const user = User.findById(decodedToken._id)

     req.user=user;
     next();
})