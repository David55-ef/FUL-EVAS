import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("⚠ MONGO_URI not set — the API will start, but every database-backed route will fail.");
    console.warn("  Set MONGO_URI in server/.env (a free MongoDB Atlas cluster works well) and restart.");
    mongoose.set("bufferCommands", false); // fail fast instead of hanging on unconnected queries
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
    console.log("✓ Connected to MongoDB");
  } catch (err) {
    console.error("✗ MongoDB connection failed:", err.message);
    console.error("  The API will keep running so /health stays reachable, but data routes will error.");
    mongoose.set("bufferCommands", false);
  }
}
