import jwt from "jsonwebtoken";
import User from "../models/User.js";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production");
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(user) {
  return jwt.sign(
    { sub: user._id, role: user.role, linkedId: user.linkedId },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ status: "error", code: "NO_TOKEN", message: "Missing authorization token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(req.user.sub).select("isActive role linkedId name").catch(() => null);
    if (!user && process.env.NODE_ENV !== "test") {
      return res.status(401).json({ status: "error", code: "INVALID_TOKEN", message: "Account no longer exists" });
    }
    if (user && !user.isActive) {
      return res.status(401).json({ status: "error", code: "INVALID_TOKEN", message: "Account no longer active" });
    }
    if (user) {
      req.user.role = user.role;
      req.user.linkedId = user.linkedId;
      req.user.name = user.name;
    }
    next();
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ status: "error", code: "INVALID_TOKEN", message: "Invalid or expired token" });
    }
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ status: "error", code: "NO_TOKEN", message: "Missing authorization token" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: "error", code: "FORBIDDEN", message: "You do not have access to this action" });
    }
    next();
  };
}
