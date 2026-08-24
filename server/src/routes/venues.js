import express from "express";
import Venue from "../models/Venue.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pick } from "../utils/pick.js";

const VENUE_UPDATE_FIELDS = ["name", "location", "capacity", "status", "art", "images", "tag", "mapX", "mapY"];

const router = express.Router();

function toClient(v, used = 0) {
  return {
    id: v._id, name: v.name, loc: v.location, cap: v.capacity, used,
    art: v.art, tag: v.tag, mx: v.mapX, my: v.mapY, status: v.status,
    images: v.images || [],
  };
}

// Public read for the demo (an exam officer / admin token would gate this in production)
router.get("/", async (req, res) => {
  const venues = await Venue.find().sort({ name: 1 });
  res.json(venues.map((v) => toClient(v, 0)));
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { name, location, capacity, art, tag, mapX, mapY } = req.body || {};
  if (!name || !location || !capacity) {
    return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "name, location, and capacity are required" });
  }
  const venue = await Venue.create({ name, location, capacity, art, tag: tag || name.slice(0, 6).toUpperCase(), mapX, mapY });
  res.status(201).json(toClient(venue));
});

router.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const updates = pick(req.body, VENUE_UPDATE_FIELDS);
  const venue = await Venue.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!venue) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Venue not found" });
  res.json(toClient(venue));
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const venue = await Venue.findByIdAndUpdate(req.params.id, { status: "INACTIVE" }, { new: true });
  if (!venue) return res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Venue not found" });
  res.json({ status: "success", message: "Venue deactivated" });
});

export default router;
