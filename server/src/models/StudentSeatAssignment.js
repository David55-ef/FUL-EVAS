import mongoose from "mongoose";

const studentSeatAssignmentSchema = new mongoose.Schema({
  examTimetable: { type: mongoose.Schema.Types.ObjectId, ref: "ExamTimetable", required: true },
  venueAllocation: { type: mongoose.Schema.Types.ObjectId, ref: "VenueAllocation", required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
  sessionKey: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  seatNumber: { type: String, required: true },
}, { timestamps: true });

studentSeatAssignmentSchema.index({ examTimetable: 1, student: 1 }, { unique: true });
studentSeatAssignmentSchema.index({ venueAllocation: 1, seatNumber: 1 }, { unique: true });
studentSeatAssignmentSchema.index({ venue: 1, sessionKey: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model("StudentSeatAssignment", studentSeatAssignmentSchema);
