import mongoose from "mongoose";
import User from "../models/User.js";
import { generateStrongPassword } from "../utils/generatePassword.js";
import sendEmailWithTemplate from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { generateTokens } from "../utils/generateTokens.js";


/* ======================================================
   Create User (Admin)
   ====================================================== */
export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    //  required
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "name and email are required",
      });
    }

    //  duplicate email
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User email already exists",
      });
    }

    //  generate password
    const plainPassword = generateStrongPassword();

    const user = await User.create({
      name,
      email,
      password: plainPassword,
      plainPassword,
    });

    //  send email
    await sendEmailWithTemplate({
      to: email,
      name,
      templateKey:
        "2518b.554b0da719bc314.k1.d3651a70-1c3c-11f1-8368-cabf48e1bf81.19cd6161d97",
      mergeInfo: {
        name,
        email,
        plainPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created and email sent",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

/* ======================================================
   Get All Users
   ====================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password");

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/* ======================================================
   Update User
   ====================================================== */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  do not allow password change from here
    if (req.body.password) delete req.body.password;
    if (req.body.email && req.body.email !== user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    Object.assign(user, req.body);
    await user.save();

    // send update email
    await sendEmailWithTemplate({
      to: user.email,
      name: user.name,
      templateKey: "2518b.554b0da719bc314.k1.22c11250-1c3c-11f1-a5af-d2cf08f4ca8c.19cd61197f5",
      mergeInfo: {
        name: user.name,
        email: user.email,
      },

    });

    const safeUser = await User.findById(user._id).select(
      "-password -plainPassword -passwordResetToken -passwordResetExpires",
    );

    res.json({
      success: true,
      message: "User updated successfully and email sent",
      data: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   Delete User
   ====================================================== */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // send email before delete
    await sendEmailWithTemplate({
      to: user.email,
      name: user.name,
      templateKey: "2518b.554b0da719bc314.k1.96096690-1c3c-11f1-8a41-525400c92439.19cd6148b79",
      mergeInfo: {
        name: user.name,
      },
    });

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted and email sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   User Login
====================================================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, "user");

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   Refresh Access Token
   ====================================================== */
export const refreshUserAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const tokens = generateTokens(user._id, "user");

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
export const logoutUser = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

/* ======================================================
   Forgot Password
   ====================================================== */
export const forgotUserPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}?type=user`;

    await sendEmailWithTemplate({
      to: user.email,
      name: user.name,
      templateKey: "2518b.554b0da719bc314.k1.10a7ee31-1b84-11f1-a241-62df313bf14d.19cd15b4493",
      mergeInfo: {
        name: user.name,
        password_reset_link: resetUrl,
      },
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send reset email" });
  }
};

/* ======================================================
   Reset Password
   ====================================================== */
export const resetUserPassword = async (req, res) => {
  try {
    let { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   Get Profile
   ====================================================== */
export const getUserProfile = async (req, res) => {
  res.json(req.user);
};

/* ======================================================
   Update Profile
   - cannot update email
   - can upload profile picture
   ====================================================== */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.email) delete req.body.email;
    if (req.body.password) delete req.body.password;

    Object.assign(user, req.body);

    if (req.file) {
      user.profilePicture = req.file.location;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
