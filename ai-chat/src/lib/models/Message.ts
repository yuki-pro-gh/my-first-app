import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { MessageRole } from "@/types";

export interface IMessageDocument extends Document {
  sessionId: Types.ObjectId;
  role: MessageRole;
  content: string;
  isConsistent?: boolean;
  llamaAnswer?: string;
  mixtralAnswer?: string;
  geminiAnswer?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "ChatSession", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    isConsistent: { type: Boolean },
    llamaAnswer: { type: String },
    mixtralAnswer: { type: String },
    geminiAnswer: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Message: Model<IMessageDocument> =
  mongoose.models.Message ??
  mongoose.model<IMessageDocument>("Message", MessageSchema);

export default Message;
