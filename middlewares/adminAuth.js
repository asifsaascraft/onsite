import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// 🔐 Protect routes for Admin
export const protectAdmin = async (req, res, next) => {
  let token;

  try {
    // Get token from Authorization header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token found
    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Attach admin to request
    req.admin = admin;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};