import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  matricNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  department: { type: String },
});

export default mongoose.model("Student", studentSchema);
