import APIErrorHandler from '../utils/APIErrorHandler.js';
import { User }  from '../src/models/user.models.js';
import asyncHandler from '../utils/asyncHandler.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import APIResponse from '../utils/APIResponse.js';



const registerUser = asyncHandler( async (req,res)=>{
     
     const {userName,email,fullName,password}=req.body;
     // console.log(req.body);

     if([userName,email,fullName,password].some((field)=>{
          if(field?.trim()==="") throw new APIErrorHandler(400,"all fields are required");
     }));

   const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });   
     
     console.log(existedUser)

     if(existedUser) {
          throw new APIErrorHandler(409,"user with email or username already exist");
     }

     const avatarLocalPath= req.files?.avatar[0]?.path;
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

export {registerUser} 