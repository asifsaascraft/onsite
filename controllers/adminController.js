import crypto from "crypto";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { generateTokens } from "../utils/generateTokens.js";
import sendEmailWithTemplate from "../utils/sendEmail.js";

/* ======================================================
   Admin Register (ONLY ONE ADMIN ALLOWED)
====================================================== */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, country, state, city, pincode } = req.body;

    // check if admin already exists
    const adminCount = await Admin.countDocuments();

    if (adminCount > 0) {
      return res.status(400).json({
        message: "Admin already created",
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      country,
      state,
      city,
      pincode,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      adminId: admin._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   Admin Login
====================================================== */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const { accessToken, refreshToken } = generateTokens(admin._id, "admin");

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   Refresh Access Token
====================================================== */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const tokens = generateTokens(admin._id, "admin");

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

/* ======================================================
   Logout
====================================================== */
export const logoutAdmin = (req, res) => {
  res.json({
    message: "Logged out successfully",
  });
};

/* ======================================================
   Forgot Password
====================================================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const resetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    admin.passwordResetToken = resetToken;

    admin.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000;

    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}?type=admin`;

    await sendEmailWithTemplate({
      to: admin.email,
      name: admin.name,
      templateKey:
        "2518b.554b0da719bc314.k1.10a7ee31-1b84-11f1-a241-62df313bf14d.19cd15b4493",
      mergeInfo: {
        name: admin.name,
        password_reset_link: resetUrl,
      },
    });

    res.json({
      message: "Password reset link sent to email",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send reset email",
    });
  }
};

/* ======================================================
   Reset Password
====================================================== */
export const resetPassword = async (req, res) => {
  try {
    let { token } = req.params;

    const { password } = req.body;

    token = token.trim();

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const admin = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    admin.password = password;
    admin.passwordResetToken = null;
    admin.passwordResetExpires = null;

    await admin.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   Update Profile
====================================================== */
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // prevent email update
    if (req.body.email) delete req.body.email;

    const allowedFields = [
      "name",
      "country",
      "state",
      "city",
      "pincode",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field]) {
        admin[field] = req.body[field];
      }
    });

    // update image
    if (req.file) {
      admin.profilePicture = req.file.location;
    }

    await admin.save();

    res.json({
      message: "Profile updated successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   Get Profile
====================================================== */
export const getAdminProfile = async (req, res) => {
  res.json(req.admin);
};