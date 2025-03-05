import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    mobile: { type: String, unique: true},
    password: { type: String, required: function() { return this.accountType === 'user'; } },
    type: { type: String, required:true, enum: ['user', 'guest'], default: 'guest' },
    status:{type: String, required:true, enum:['ACTIVE','INACTIVE'], default :'ACTIVE'},
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
  }, { timestamps: true });

export default mongoose.model ("user",userSchema)