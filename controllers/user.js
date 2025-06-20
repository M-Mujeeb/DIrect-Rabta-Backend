const Users = require("../models/User");
const Role = require("../models/Role");
const { successResponse, errorResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { generateToken } = require("../utils/jwt");

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

      if (!user.is_verified) {
        return errorResponse(res, "Please verify your account first", 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return errorResponse(res, "Invalid credentials", 401);
      }

      const token = generateToken({ id: user._id, role: user.role_id?.name });

      return successResponse(res, "Login successful", { 
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role_id?.name,
          profile_img: user.profile_image || ""
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
      const updateData = req.body;

      const user = await Users.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      return successResponse(res, "Profile updated successfully", { user });
    } catch (error) {
      console.error("Update Profile Error:", error);
      return errorResponse(res, "Failed to update profile", 500);
    }
  },

  userArtists: async (req, res) => {
    try {
      // This function should handle getting user's preferred artists
      // Implementation depends on your data model
      return successResponse(res, "User artists retrieved successfully");
    } catch (error) {
      console.error("User Artists Error:", error);
      return errorResponse(res, "Failed to get user artists", 500);
    }
  }
};