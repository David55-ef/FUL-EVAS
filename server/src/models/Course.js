import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  department: { type: String },
  level: { type: Number },
  durationMins: { type: Number, default: 120 },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
});
courseSchema.index({ semester: 1, code: 1 }, { unique: true });

export default mongoose.model("Course", courseSchema);
