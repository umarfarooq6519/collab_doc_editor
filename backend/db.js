import mongoose from "mongoose";
import Document from "./doc.model.js";

export const connectDB = async (uri) => {
  try {
    const conn = await mongoose.connect(uri);
    console.log("MongoDB connected", conn.connection.host);
  } catch (e) {
    console.log("connectDB() error: " + e);

    throw e;
  }
};

export const fetchDocs = async () => {
  try {
    const docs = await Document.find({});

    return docs;
  } catch (e) {
    console.log("fetchDocs() error: ", e);
    throw e;
  }
};
