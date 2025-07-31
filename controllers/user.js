const Users = require("../models/User");
const Role = require("../models/Role");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const UserPlan = require("../models/UserPlan");

const { successResponse, errorResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { generateToken } = require("../utils/jwt");
const fs = require("fs");
const path = require("path");

module.exports = {
  addUser: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return errorResponse(res, "Please provide email, name, and password", 400);
      }

      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return errorResponse(res, "Email already in use", 409);
      }

      const role = await Role.findOne({ name: "fan" });
      if (!role) {
        return errorResponse(res, "User role not found", 500);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = crypto.randomInt(100000, 999999).toString();

      const newUser = new Users({
        email,
        password: hashedPassword,
        otp,
        name: name,
        role_id: role._id,
        is_verified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newUser.save();
      await sendEmail(email, "Verify your account", `Your OTP is: ${otp}`);

      return successResponse(res, "OTP sent to your email", { email });
    } catch (error) {
      console.error("Registration Error:", error);
      return errorResponse(res, "Failed to register user", 500);
    }
  },

  verifyUser: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return errorResponse(res, "Please provide email and OTP", 400);
      }

      const user = await Users.findOne({ email });
      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      if (user.otp !== otp) {
        return errorResponse(res, "Invalid OTP", 400);
      }

      user.is_verified = true;
      user.otp = null;
      await user.save();

      return successResponse(res, "User verified successfully");
    } catch (error) {
      console.error("Verification Error:", error);
      return errorResponse(res, "Failed to verify user", 500);
    }
  },

  resendOTP: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return errorResponse(res, "Please provide email", 400);
      }

      const user = await Users.findOne({ email });
      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      user.otp = otp;
      await user.save();

      await sendEmail(email, "Verify your account", `Your OTP is: ${otp}`);

      return successResponse(res, "OTP resent successfully");
    } catch (error) {
      console.error("Resend OTP Error:", error);
      return errorResponse(res, "Failed to resend OTP", 500);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;


      if (!email || !password) {
        return errorResponse(res, "Please provide email and password", 400);
      }

      const user = await Users.findOne({ email }).populate('role_id');
      if (!user) {
        return errorResponse(res, "Invalid credentials", 401);
      }

      if (user.role_id.name === "admin") {
        return errorResponse(res, "Invalid credentials", 401);
      }

      if (!user.is_verified) {
        return errorResponse(res, "Please verify your account first", 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return errorResponse(res, "Invalid credentials", 401);
      }

      const token = generateToken({ id: user._id, role: user.role_id?.name });

      const BASE_URL = process.env.BASE_URL

      return successResponse(res, "Login successful", { 
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role_id?.name,
          profile_img: user.profile_image
                      ? `${BASE_URL}${user.profile_image}`
                      : "",
        },
        token 
      });
    } catch (error) {
      console.error("Login Error:", error);
      return errorResponse(res, "Failed to login", 500);
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return errorResponse(res, "Please provide email", 400);
      }

      const user = await Users.findOne({ email });
      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      user.otp = otp;
      await user.save();

      await sendEmail(email, "Reset your password", `Your reset token is: ${otp}`);

      return successResponse(res, "Password reset email sent");
    } catch (error) {
      console.error("Forgot Password Error:", error);
      return errorResponse(res, "Failed to send reset email", 500);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return errorResponse(res, "Please provide email, token, and new password", 400);
      }

      const user = await Users.findOne({ 
        email, 
        otp: token,
      });

      if (!user) {
        return errorResponse(res, "Invalid or expired reset token", 400);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.otp = null;
      await user.save();

      return successResponse(res, "Password reset successfully");
    } catch (error) {
      console.error("Reset Password Error:", error);
      return errorResponse(res, "Failed to reset password", 500);
    }
  },

  userPrefrences: async (req, res) => {
    try {
      // This function should handle user preferences
      // Implementation depends on your User model structure
      return successResponse(res, "User preferences updated successfully");
    } catch (error) {
      console.error("User Preferences Error:", error);
      return errorResponse(res, "Failed to update preferences", 500);
    }
  },

  googleVerify: async (req, res) => {
    try {
      // This function should handle Google login verification
      // Implementation depends on your Google OAuth setup
      return successResponse(res, "Google login successful");
    } catch (error) {
      console.error("Google Login Error:", error);
      return errorResponse(res, "Failed to login with Google", 500);
    }
  },

  appleLogin: async (req, res) => {
    try {
      // This function should handle Apple login
      // Implementation depends on your Apple Sign-In setup
      return successResponse(res, "Apple login successful");
    } catch (error) {
      console.error("Apple Login Error:", error);
      return errorResponse(res, "Failed to login with Apple", 500);
    }
  },

 updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name } = req.body;
      const BASE_URL = process.env.BASE_URL;

      const user = await Users.findById(userId);
      if (!user) return errorResponse(res, "User not found", 404);

      let updateData = { updatedAt: new Date() };

      if (name) updateData.name = name;

      if (req.file) {

        if (user.profile_image) {
          const oldImagePath = path.join(__dirname, "..", user.profile_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        updateData.profile_image = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await Users.findByIdAndUpdate(userId, updateData, {
        new: true,
      });

      return successResponse(res, "Profile updated successfully", {
        id: updatedUser._id,
        name: updatedUser.name,
        profile_image: updatedUser.profile_image
          ? `${BASE_URL}${updatedUser.profile_image}`
          : "",
      });
    } catch (error) {
      console.error("Update Profile Error:", error);
      return errorResponse(res, "Failed to update profile", 500);
    }
  },

  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return errorResponse(res, "Both current and new passwords are required", 400);
      }

      const user = await Users.findById(userId);
      if (!user) return errorResponse(res, "User not found", 404);

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return errorResponse(res, "Current password is incorrect", 401);
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedNewPassword;
      user.updatedAt = new Date();
      await user.save();

      return successResponse(res, "Password changed successfully");
    } catch (error) {
      console.error("Change Password Error:", error);
      return errorResponse(res, "Failed to change password", 500);
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await Users.findById(userId);
      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      // Delete profile image from disk (if exists)
      if (user.profile_image) {
        const imagePath = path.join(__dirname, "..", user.profile_image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await Users.findByIdAndDelete(userId);

      return successResponse(res, "Account deleted successfully");
    } catch (error) {
      console.error("Delete Account Error:", error);
      return errorResponse(res, "Failed to delete account", 500);
    }
  },

  getPaymentHistory: async (req, res) => {
  try {
    const fanId = req.user.id;

    // Validate user role
    const user = await Users.findById(fanId).populate("role_id");
    if (!user || user.role_id.name !== "fan") {
      return errorResponse(res, "Only fans can access payment history", 403);
    }

    // Fetch payments with plan info
    const payments = await Payment.find({ user_id: fanId })
      .sort({ paid_at: -1 })
      .populate("plan_id", "name") // only plan name needed
      .lean();

    // Group payments by recency
    const now = new Date();
    const last7Days = [];
    const lastMonth = [];

    for (const p of payments) {
      const daysDiff = Math.floor((now - new Date(p.paid_at)) / (1000 * 60 * 60 * 24));
      const formatted = {
        amount: p.amount,
        plan_name: p.plan_id?.name || "Plan",
        paid_at: p.paid_at,
        currency: p.currency,
        transaction_id: p.transaction_id
      };

      if (daysDiff <= 7) {
        last7Days.push(formatted);
      } else {
        lastMonth.push(formatted);
      }
    }

    return successResponse(res, "Payment history fetched", {
      last7Days,
      lastMonth
    });

  } catch (err) {
    console.error("Payment history error:", err);
    return errorResponse(res, "Failed to fetch payment history", 500);
  }
},

increaseLimit: async (req, res) => {
  try {
    const { count } = req.body;
    const userId = req.user.id;

    // Validate count
    if (!count || typeof count !== "number" || count <= 0) {
      return errorResponse(res, "Invalid count provided", 400);
    }

    const userPlan = await UserPlan.findOneAndUpdate(
      { user_id: userId },
      { $inc: { remaining_messages: count } },
      { new: true, runValidators: true }
    );

    if (!userPlan) {
      return errorResponse(res, "User plan not found", 404);
    }

    return successResponse(res, "Limit increased successfully", userPlan);
  } catch (err) {
    console.error("Increase limit error:", err);
    return errorResponse(res, "Failed to increase limit", 500);
  }
}


};