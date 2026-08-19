import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export default mongoose.model("Session", sessionSchema);
