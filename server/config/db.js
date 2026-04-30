import mongoose from "mongoose";

const connectDB = async (retries = 5) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected successfully");
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i}/${retries} failed:`, error.message);
      if (i === retries) {
        console.error("All MongoDB connection attempts exhausted. Server will run but DB calls will fail.");
        return;
      }
      // Wait before retrying (2s, 4s, 6s, 8s...)
      await new Promise((r) => setTimeout(r, i * 2000));
    }
  }
};

export default connectDB;