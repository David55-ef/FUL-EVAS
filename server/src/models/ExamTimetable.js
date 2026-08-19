import mongoose from "mongoose";

const examTimetableSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, unique: true },
  timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: "TimeSlot", required: true },
  examDate: { type: Date, required: true },
  clash: { type: Boolean, default: false },
});

export default mongoose.model("ExamTimetable", examTimetableSchema);
