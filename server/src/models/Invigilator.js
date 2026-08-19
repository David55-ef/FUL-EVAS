import mongoose from "mongoose";

const invigilatorSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String },
  contact: { type: String },
});

export default mongoose.model("Invigilator", invigilatorSchema);
