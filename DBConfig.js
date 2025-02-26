import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  const URL = process.env.MONGODB_URL;

  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB URL is not defined in the Environment Variables");
  }

  try {
    await mongoose.connect(URL);
  } catch (error) {
    console.error("Mongo DB Connection error", error.message);
    process.exit(1);
}
};

connectDB();

export default connectDB;
