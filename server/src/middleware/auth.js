import jwt from "jsonwebtoken";

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

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ status: "error", code: "NO_TOKEN", message: "Missing authorization token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ status: "error", code: "INVALID_TOKEN", message: "Invalid or expired token" });
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
