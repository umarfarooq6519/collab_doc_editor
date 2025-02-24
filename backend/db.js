import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    const conn = await mongoose.connect(uri);
    console.log("MongoDB connected", conn.connection.host);
  } catch (e) {
    console.log("connectDB() error: " + e);
    process.exit(1);
  }
};
