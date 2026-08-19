import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  label: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

export default mongoose.model("TimeSlot", timeSlotSchema);
