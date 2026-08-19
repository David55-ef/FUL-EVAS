import express from "express";
import Invigilator from "../models/Invigilator.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Staff directory (names + departments) is only for signed-in staff —
// not something an unauthenticated visitor to the public site should see.
router.get("/", requireAuth, requireRole("ADMIN", "EXAM_OFFICER"), async (req, res) => {
  const list = await Invigilator.find().sort({ name: 1 });
  res.json(list.map((i) => ({ id: i.staffId, name: i.name, dept: i.department || "—" })));
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { staffId, name, department, contact } = req.body || {};
  if (!staffId || !name) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "staffId and name are required" });
  }
  const invigilator = await Invigilator.create({ staffId, name, department, contact });
  res.status(201).json(invigilator);
});

export default router;
