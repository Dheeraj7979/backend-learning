import mongoose,{Schema} from 'mongoose'
import {bcrypt} from 'bcrypt'
import jwt from "jsonwebtoken"

const userSchema= Schema({
     userName:{
          type:String,
          required:true,
          lowercase:true,
          unique:true
     },
     email:{
          type:String,
          required:true,
          unique:true,
          lowercase:true
     },
     fullName:{
          type:String,
          required:true,
     },
     avatar:{
          type:String,
     },
     coverImage:{
          type:String,
     },
     password:{
          type:String,
          required:true,
     },
     refreshToken:{
          type:String,
     },
     watchHistory:{
          type:Schema.Types.ObjectId,
          ref:"Video"
     }

},{timestamps:true}
)
     // HASH PASSWORD USING BCRYPT PACKAGE...
userSchema.pre("save", async function(next){
     if(!this.isModified("password")) return next()
     this.password= await bcrypt.hash(this.password,8);
     next();
})
          //CHECK PASSWORD CORRECT OR NOT USING BCRYPT 
userSchema.methods.isPasswordCorrect=async function(password){
     return await bcrypt.compare(password,this.password);
}

     //GENERATE ACCESS TOKEN...
userSchema.methods.generateAccessToken= function(){
     jwt.sign(
          {
               _id:this._id,
               email:this.email,
               userName:this.userName,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
               expiresIn:process.env.ACCESS_TOKEN_EXPRIRESIN
          }
     )
}
userSchema.methods.generateRefreshToken= function(){
     jwt.sign(
          {
               _id:this._id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
               expiresIn:process.env.REFRESH_TOKEN_EXPRIRESIN
          }
     )
}



export const User = mongoose.model("User",userSchema);
