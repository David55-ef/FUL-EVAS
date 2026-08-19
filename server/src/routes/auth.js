import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Invigilator from "../models/Invigilator.js";
import { signToken } from "../middleware/auth.js";
import { departmentFromMatric } from "../utils/department.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { role, id, password } = req.body || {};
  if (!role || !id) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "role and id are required" });
  }

  const roleMap = { admin: "ADMIN", officer: "EXAM_OFFICER", invigilator: "INVIGILATOR", student: "STUDENT" };
  const dbRole = roleMap[role];
  if (!dbRole) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "Unknown role" });
  }

  const user = await User.findOne({ username: id, role: dbRole, isActive: true });
  if (!user) {
    return res.status(401).json({ status: "error", code: "INVALID_CREDENTIALS", message: "No matching account found" });
  }

  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) {
    return res.status(401).json({ status: "error", code: "INVALID_CREDENTIALS", message: "Incorrect password" });
  }

  const token = signToken(user);
  // The frontend never gets to choose who it's signed in as — every claim in
  // the token, and everything in this response, is looked up server-side
  // from the verified account that the id + password just matched.
  const payload = { status: "success", token, role, userId: user._id, name: user.name || null, department: null };

  if (dbRole === "STUDENT") {
    const student = await Student.findById(user.linkedId).catch(() => null);
    if (student) {
      payload.name = student.name;
      payload.matricNo = student.matricNo;
      // Auto-detected from the matric number itself, not from whatever the
      // student record happens to have stored — this is the "tell me my
      // department automatically" behaviour the login screen surfaces.
      payload.department = departmentFromMatric(student.matricNo) || student.department || null;
    }
  } else if (dbRole === "INVIGILATOR") {
    const staff = await Invigilator.findById(user.linkedId).catch(() => null);
    if (staff) {
      payload.name = staff.name;
      payload.department = staff.department || null;
    }
  }

  res.json(payload);
});

export default router;
