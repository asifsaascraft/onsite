import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

export const protectAdminOrUser = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check admin first
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      req.role = "admin";
      return next();
    }

    // check user
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.role = "user";
      return next();
    }

    return res.status(401).json({
      message: "Unauthorized access",
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};