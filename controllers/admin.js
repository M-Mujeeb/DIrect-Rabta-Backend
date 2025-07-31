const Users = require("../models/User");
const Roles = require("../models/Role");
const Plans = require("../models/Plan")
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { successResponse, errorResponse } = require("../utils/response");

module.exports = {
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

      if (user.role_id.name !== "admin") {
        return errorResponse(res, "Invalid credentials", 401);
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
  getAllCustomers: async (req, res) => {
    try {
      const fanRole = await Roles.findOne({ name: "fan" });

      if (!fanRole) {
        return errorResponse(res, "Fan role not found", 404);
      }

      const fans = await Users.find({ role_id: fanRole._id }).populate("role_id");

      return successResponse(res, "Fans fetched successfully", { users: fans });
    } catch (error) {
      console.error("Get All Customers Error:", error);
      return errorResponse(res, "Failed to fetch fans", 500);
    }
  },
  getAllCelebrities:async (req, res) => {
    try {
      const celebrityRole = await Roles.findOne({ name: "celebrity" });

      if (!celebrityRole) {
        return errorResponse(res, "Celebrity role not found", 404);
      }

      const celebrities = await Users.find({ role_id: celebrityRole._id }).populate("role_id");

      return successResponse(res, "Celebrities fetched successfully", { users: celebrities });
    } catch (error) {
      console.error("Get All Customers Error:", error);
      return errorResponse(res, "Failed to fetch fans", 500);
    }
  },
  getAllPlans:async (req, res) => {
    try {
      const plans = await Plans.find();

      if (!plans) {
        return errorResponse(res, "Plans not found", 404);
      }

      return successResponse(res, "Plans fetched successfully", { users: plans });
    } catch (error) {
      console.error("Get All Customers Error:", error);
      return errorResponse(res, "Failed to fetch fans", 500);
    }
  }
};
