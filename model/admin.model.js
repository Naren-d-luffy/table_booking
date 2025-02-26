import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default:"Admin", required: true },
    status:{type:String, enum:["ACTIVE", "INACTIVE"], required:true, default:"ACTIVE"},
}, { timestamps: true });


adminSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password; 
  return user;
};

export default mongoose.model("Admin", adminSchema);
