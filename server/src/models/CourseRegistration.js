import mongoose from "mongoose";

const courseRegistrationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
});
courseRegistrationSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model("CourseRegistration", courseRegistrationSchema);
