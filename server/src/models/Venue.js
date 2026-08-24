import mongoose from "mongoose";

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  art: { type: String, default: "nlt" },
  // Real campus photos, served from client/public/venues/<slug>/. Paths are
  // relative to the frontend's own domain (e.g. "/venues/lt-a/lt-a-1.jpg"),
  // so they load instantly with no external API call and no per-day quota,
  // unlike the Google Custom Search fallback used when this is empty.
  images: { type: [String], default: [] },
  tag: { type: String, required: true },
  mapX: { type: Number, default: 200 },
  mapY: { type: Number, default: 125 },
}, { timestamps: true });

export default mongoose.model("Venue", venueSchema);
