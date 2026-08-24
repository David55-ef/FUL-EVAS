import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import venueRoutes from "./routes/venues.js";
import courseRoutes from "./routes/courses.js";
import invigilatorRoutes from "./routes/invigilators.js";
import timetableRoutes from "./routes/timetable.js";
import allocationRoutes from "./routes/allocation.js";
import meRoutes from "./routes/me.js";
import imageRoutes from "./routes/images.js";
import studentRoutes from "./routes/students.js";
import registrationRoutes from "./routes/registrations.js";

export function createApp() {
  const app = express();

  // Sets a sane set of security headers (no-sniff, no framing, HSTS in prod, etc.)
  app.use(helmet());

  // Only the configured frontend origin(s) may call this API with credentials.
  // CORS_ORIGIN can be a comma-separated list for multiple deployed frontends.
  // Falls back to allowing any origin only when CORS_ORIGIN is unset, so the
  // app still runs out of the box in local dev.
  const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
  app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));

  app.use(express.json());

  // Brute-force protection on login specifically: 20 attempts per 15 minutes
  // per IP. Failed *and* successful attempts count, which is deliberate —
  // it caps how fast an attacker can try passwords against any one account.
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: "error", code: "TOO_MANY_ATTEMPTS", message: "Too many login attempts. Try again later." },
  });
  app.use("/api/v1/auth/login", loginLimiter);

  app.get("/health", (req, res) => res.json({ status: "ok", service: "ful-evas-api" }));

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/venues", venueRoutes);
  app.use("/api/v1/courses", courseRoutes);
  app.use("/api/v1/invigilators", invigilatorRoutes);
  app.use("/api/v1/timetable", timetableRoutes);
  app.use("/api/v1/allocation", allocationRoutes);
  app.use("/api/v1/me", meRoutes);
  app.use("/api/v1/images", imageRoutes);
  app.use("/api/v1/students", studentRoutes);
  app.use("/api/v1/registrations", registrationRoutes);

  // Consistent error envelope for anything that slips through a route's own handling
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ status: "error", code: "INTERNAL_ERROR", message: "Unexpected server error" });
  });

  app.use((req, res) => {
    res.status(404).json({ status: "error", code: "NOT_FOUND", message: "No route matches this request" });
  });

  return app;
}
