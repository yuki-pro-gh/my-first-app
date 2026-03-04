import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDocument extends Document {
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", UserSchema);

export default User;
