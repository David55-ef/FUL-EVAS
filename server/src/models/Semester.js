import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  name: { type: String, required: true, enum: ["First", "Second"] },
});
semesterSchema.index({ session: 1, name: 1 }, { unique: true });

export default mongoose.model("Semester", semesterSchema);
