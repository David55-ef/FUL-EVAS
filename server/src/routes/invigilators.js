import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Invigilator from "../models/Invigilator.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pick } from "../utils/pick.js";

const router = express.Router();
const INVIGILATOR_FIELDS = ["staffId", "name", "department", "contact"];

router.get("/", requireAuth, requireRole("ADMIN", "EXAM_OFFICER"), async (req, res) => {
  const list = await Invigilator.find({ isActive: { $ne: false } }).sort({ name: 1 });
  res.json(list.map((staff) => ({
    _id: staff._id,
    id: staff.staffId,
    name: staff.name,
    dept: staff.department || "—",
    contact: staff.contact || "",
  })));
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { password, ...body } = req.body || {};
  const input = pick(body, INVIGILATOR_FIELDS);
  if (!input.staffId || !input.name || !password || password.length < 8) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "staffId, name, and a password of at least 8 characters are required" });
  }
  input.staffId = input.staffId.trim().toUpperCase();

  let created;
  await mongoose.connection.transaction(async (session) => {
    [created] = await Invigilator.create([input], { session });
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create([{
      username: created.staffId,
      passwordHash,
      role: "INVIGILATOR",
      name: created.name,
      linkedId: created._id,
    }], { session });
  });
  res.status(201).json(created);
});

router.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const updates = pick(req.body, ["name", "department", "contact"]);
  const staff = await Invigilator.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!staff) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Invigilator not found" });
  await User.updateOne({ linkedId: staff._id, role: "INVIGILATOR" }, { name: staff.name });
  res.json(staff);
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const staff = await Invigilator.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!staff) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Invigilator not found" });
  await User.updateOne({ linkedId: staff._id, role: "INVIGILATOR" }, { isActive: false });
  res.json({ status: "success", message: "Invigilator deactivated" });
});

export default router;
