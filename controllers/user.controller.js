import APIErrorHandler from '../utils/APIErrorHandler.js';
import { User }  from '../models/user.models.js';
import asyncHandler from '../utils/asyncHandler.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import APIResponse from '../utils/APIResponse.js';
import jwt from "jsonwebtoken"
// import { useSyncExternalStore } from 'react';

const generateAccessAndRefreshToken= async function(user){
     try{
          const accessToken=await  user.generateAccessToken()
          const refreshToken=await user.generateRefreshToken();

          user.refreshToken=refreshToken
          user.save({validateBeforeSave: false})

          return {accessToken,refreshToken}
    }
    catch(error){
          throw new APIErrorHandler(500,"something went wrong during generating tokens")
    }
}

const registerUser = asyncHandler( async (req,res)=>{
     
     
     const {userName,email,fullName,password}=req.body;
     console.log(req.body);

     if([userName,email,fullName,password].some((field)=>{
          if(field?.trim()==="") throw new APIErrorHandler(400,"all fields are required");
     }));

   const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });   
     
     

     if(existedUser) {
          throw new APIErrorHandler(409,"user with email or username already exist");
     }
     let avatarLocalPath;

     if(req.files==undefined){
          throw new APIErrorHandler(400,"avatar is required");
     } else if(req.files.avatar==undefined){
          throw new APIErrorHandler(400,"Avatar is required ")
     } else if(req.files.avatar[0]===undefined) {
          throw new APIErrorHandler(400,"Avatar is required ")
     } else {
          avatarLocalPath= req.files?.avatar[0]?.path;
     }

     const coverImagePath= req.files?.coverImage[0]?.path;

     if(!avatarLocalPath) {
          console.log("does not find file locally ")
          throw new APIErrorHandler(400,"Avatar file is required");
     }
     
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImagePath);

    if(!avatar) {
     console.log("cloudinary error ")
     throw new APIErrorHandler(400,"Avatar file is required");
    }

    const newUser= await User.create({
     fullName,
     avatar: avatar.url,
     coverImage: coverImage?.url|| "",
     email,
     userName:userName.toLowerCase(),
     password,
    })

  const createdUser = await User.findById(newUser._id).select(
     "-password -refreshToken"
  )
  if(!createdUser){
     throw new APIErrorHandler(500,"something went wrong white registering the user")
  }

  return res.status(201).json(
     new APIResponse(200,createdUser,"User registered successfully")
  )

})

const loginUser = asyncHandler( async(req,res)=>{

     const {userName,email,password}= req.body;
     if(!userName && !email){
          throw new APIErrorHandler(400,"Username or email required");
     }
     
     if(!password) {
          throw new APIErrorHandler(404,"Password is required");
     }

     let user = await User.findOne({
          $or: [{userName},{email}]
     })

    const isPasswordCorrect=await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
     throw new APIErrorHandler(404,"wrong password");
    }

    const {accessToken,refreshToken} =await  generateAccessAndRefreshToken(user);

    
   user = await User.findById(user._id).select("-password");


    const options={
     httpOnly:true,
     secure:true,
    }
    
    res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
     new APIResponse(200,{accessToken,refreshToken,user}, "user logged in "));
      
 })

const logoutUser = asyncHandler( async(req,res)=>{
     
     await User.findByIdAndUpdate(
         req.user._id,
          {
               $set: {
                    refreshToken:undefined
               }
          },
          {
               new:true,
          }
     )

     const options= {
          httpOnly:true,
          secure:true,
     }

     res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
          {
               "Status":200,
               "message":"user logged out successfully",          
          }
     )

})

const refreshAccessToken = asyncHandler( async(req,res)=>{

     const token = req.cookies?.refreshToken;
     if(!token) {
          throw new APIErrorHandler(401, "Unauthorized access ")
     }

     const decodedToken =jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

     if(!decodedToken){
          throw new APIErrorHandler(401,"Unauthorized access ")
     }

     let user = await User.findById(decodedToken._id).select("-password")

     if(!user){
          throw new APIErrorHandler(401, "Unauthorized access")
     }

     if(token !=user.refreshToken ){
          throw new APIErrorHandler(401, "Unauthorized access")
     }

   const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user);

   console.log("access ;",accessToken, "refresh: ",refreshToken)
  
   const options = {
     httpOnly:true,
     secure:true,
   }

   res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
     new APIResponse(
          201,
          {
               user,accessToken,refreshToken,
          },
          "new Access Token generated "
     )
   )

})





export {registerUser,loginUser,logoutUser,refreshAccessToken}