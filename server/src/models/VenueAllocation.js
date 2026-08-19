import mongoose from "mongoose";

const venueAllocationSchema = new mongoose.Schema({
  examTimetable: { type: mongoose.Schema.Types.ObjectId, ref: "ExamTimetable", required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
  studentCount: { type: Number, required: true, min: 0 },
});
venueAllocationSchema.index({ examTimetable: 1, venue: 1 }, { unique: true });

export default mongoose.model("VenueAllocation", venueAllocationSchema);
