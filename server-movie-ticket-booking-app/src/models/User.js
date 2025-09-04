"use strict";
import { Schema, model } from "mongoose";

const DOCUMENT_NAME = "apiKey";
const COLLECTION_NAME = "apiKeys";

const userSchema = new Schema(
  {
    _id: { type: String, require: true },
    name: { type: String, require: true },
    email: { type: String, require: true },
    image: { type: String, require: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const User = model(DOCUMENT_NAME, userSchema);
export default User;
