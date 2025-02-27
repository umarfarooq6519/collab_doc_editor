import { Schema, model } from "mongoose";

const DocumentSchema = new Schema(
  {
    _id: String,
    data: Object,
  },
  {
    timestamps: true,
  }
);

const Document = model("document", DocumentSchema);

export default Document;
