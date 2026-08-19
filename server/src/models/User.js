import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ["ADMIN", "EXAM_OFFICER", "INVIGILATOR", "STUDENT"] },
  name: { type: String },
  linkedId: { type: mongoose.Schema.Types.ObjectId },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
