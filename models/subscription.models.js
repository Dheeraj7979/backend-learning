import { model, Schema } from "mongoose";

const subscriptionSchema = Schema(
     {
     subscriber:{
          type:Schema.Types.ObjectId,
          ref:"User",
          required:true
        },
     channel:{
          type:Schema.Types.ObjectId,
          ref:"User",
          required:true
        },

     },
{
     timestamps:true
}
)

export const Subscription = model("Subscription",subscriptionSchema)