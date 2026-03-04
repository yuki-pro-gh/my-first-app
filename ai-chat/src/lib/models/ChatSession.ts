import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IChatSessionDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "新しいチャット" },
  },
  { timestamps: true }
);

const ChatSession: Model<IChatSessionDocument> =
  mongoose.models.ChatSession ??
  mongoose.model<IChatSessionDocument>("ChatSession", ChatSessionSchema);

export default ChatSession;
