import mongoose from "mongoose";

const invigilatorAssignmentSchema = new mongoose.Schema({
  venueAllocation: { type: mongoose.Schema.Types.ObjectId, ref: "VenueAllocation", required: true },
  invigilator: { type: mongoose.Schema.Types.ObjectId, ref: "Invigilator", required: true },
});
invigilatorAssignmentSchema.index({ venueAllocation: 1, invigilator: 1 }, { unique: true });

export default mongoose.model("InvigilatorAssignment", invigilatorAssignmentSchema);
