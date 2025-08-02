const Users = require("../models/User");
const Roles = require("../models/Role");
const Plans = require("../models/Plan")
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Messages = require("../models/Message")
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

      const baseUrl = process.env.BASE_URL;
      const updatedFans = fans.map((user) => {
        return {
          ...user.toObject(),
          profile_image: user.profile_image ? baseUrl + user.profile_image : null,
        };
      });
      return successResponse(res, "Fans fetched successfully", { users: updatedFans });
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
      const baseUrl = process.env.BASE_URL;
      const celebrities = await Users.find({ role_id: celebrityRole._id }).populate("role_id").sort({ createdAt: -1 });;

      const updatedCelebrities = celebrities.map((user) => {
        return {
          ...user.toObject(),
          profile_image: user.profile_image ? baseUrl + user.profile_image : null,
        };
      });

      return successResponse(res, "Celebrities fetched successfully", { users: updatedCelebrities });
    } catch (error) {
      console.error("Get All Customers Error:", error);
      return errorResponse(res, "Failed to fetch fans", 500);
    }
  },

  addCelebrity: async(req, res)=>{
    try {
      const { name, email, password, about, type } = req.body;

      if (!name || !email || !password || !type || !about) {
        return errorResponse(res, "All fields are required", 400);
      }

      // Check for existing email
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return errorResponse(res, "Email already in use", 409);
      }

      // Get celebrity role
      const role = await Roles.findOne({ name: "celebrity" });
      if (!role) {
        return errorResponse(res, "Celebrity role not found", 500);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = crypto.randomInt(100000, 999999).toString();

      // Handle profile image if uploaded
      let profileImagePath = null;
      if (req.file) {
        profileImagePath = `/uploads/${req.file.filename}`;
      }

      // Create user
      const newUser = new Users({
        name,
        email,
        password: hashedPassword,
        otp,
        is_verified: false,
        about,
        celebrity_type: type,
        profile_image: profileImagePath,
        role_id: role._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newUser.save();

      await sendEmail(email, "Verify your account", `Your OTP is: ${otp}`);

      return successResponse(res, "Celebrity created successfully. OTP sent to email.", { email });
    } catch (error) {
      console.error("Add Celebrity Error:", error);
      return errorResponse(res, "Failed to create celebrity", 500);
    }
  
  },
  updateCelebrity: async (req, res) => {
    try {
      const { name, password, about, type } = req.body;
      const { id } = req.params;
  
      const user = await Users.findById(id);
      if (!user) {
        return errorResponse(res, "Celebrity not found", 404);
      }
  
      // Prevent email from being updated
      if (req.body.email && req.body.email !== user.email) {
        return errorResponse(res, "Email cannot be changed", 403);
      }
  
      // Update allowed fields
      if (name) user.name = name;
      if (about) user.about = about;
      if (type) user.celebrity_type = type;
  
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
  
      if (req.file) {
        user.profile_image = `/uploads/${req.file.filename}`;
      }
  
      user.updatedAt = new Date();
  
      await user.save();

      const updatedUser = await Users.findById(id)
      .select("-password -__v -otp -favorites");
      return successResponse(res, "Celebrity updated successfully", updatedUser);
    } catch (error) {
      console.error("Update Celebrity Error:", error);
      return errorResponse(res, "Failed to update celebrity", 500);
    }
  },
  deleteCelebrity: async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await Users.findById(id);
      if (!user) {
        return errorResponse(res, "Celebrity not found", 404);
      }
  
      await Users.findByIdAndDelete(id);
  
      return successResponse(res, "Celebrity deleted successfully");
    } catch (error) {
      console.error("Delete Celebrity Error:", error);
      return errorResponse(res, "Failed to delete celebrity", 500);
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
  },

  addPlan: async (req, res) => {
    try {
      const { name, description, amount, message_limit, priority_delivery, is_most_popular } = req.body;
  
      if (!name || !description || !amount) {
        return errorResponse(res, "Name, description, and amount are required", 400);
      }
  
      const newPlan = new Plans({
        name,
        description,
        price: parseFloat(amount),
        message_limit: parseInt(message_limit) || 0,
        priority_delivery: priority_delivery === "true" || priority_delivery === true,
        is_most_popular: is_most_popular === "true" || is_most_popular === true,
      });
  
      await newPlan.save();
      return successResponse(res, "Plan created successfully", newPlan);
    } catch (error) {
      console.error("Add Plan Error:", error);
      return errorResponse(res, "Failed to create plan", 500);
    }
  },
  updatePlan: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, amount, message_limit, priority_delivery, is_most_popular } = req.body;
  
      const plan = await Plans.findById(id);
      if (!plan) return errorResponse(res, "Plan not found", 404);
  
      if (name) plan.name = name;
      if (description) plan.description = description;
      if (amount) plan.price = parseFloat(amount);
      if (message_limit !== undefined) plan.message_limit = parseInt(message_limit);
      if (priority_delivery !== undefined) plan.priority_delivery = priority_delivery === "true" || priority_delivery === true;
      if (is_most_popular !== undefined) plan.is_most_popular = is_most_popular === "true" || is_most_popular === true;
  
      await plan.save();
      return successResponse(res, "Plan updated successfully", plan);
    } catch (error) {
      console.error("Update Plan Error:", error);
      return errorResponse(res, "Failed to update plan", 500);
    }
  },

  deletePlan: async (req, res) => {
    try {
      const { id } = req.params;
  
      const plan = await Plans.findById(id);
      if (!plan) return errorResponse(res, "Plan not found", 404);
  
      await Plan.findByIdAndDelete(id);
      return successResponse(res, "Plan deleted successfully");
    } catch (error) {
      console.error("Delete Plan Error:", error);
      return errorResponse(res, "Failed to delete plan", 500);
    }
  },

  getAllVoiceNotes: async (req, res) => {
    try {
      const baseURL = process.env.BASE_URL
      const formatMessage = (messages) =>
        messages.map((msg) => ({
          fan_name: msg.sender_id?.name || "Unknown Fan",
          celebrity_name: msg.receiver_id?.name || "Unknown Celebrity",
          sent_at: msg.sent_at ? new Date(msg.sent_at).toLocaleString() : "N/A",
          voice_note: msg.content ? `${baseURL}${msg.content}` : null
        }));
  
      const [pendingRaw, acceptedRaw, rejectedRaw] = await Promise.all([
        Messages.find({ type: "voice", approved: false, rejected: false })
          .populate("sender_id", "name")
          .populate("receiver_id", "name")
          .sort({ sent_at: -1 }),
  
          Messages.find({ type: "voice", approved: true, rejected: false })
          .populate("sender_id", "name")
          .populate("receiver_id", "name")
          .sort({ sent_at: -1 }),
  
          Messages.find({ type: "voice", approved: false, rejected: true })
          .populate("sender_id", "name")
          .populate("receiver_id", "name")
          .sort({ sent_at: -1 }),
      ]);
  
      return successResponse(res, "Voice notes fetched successfully", {
        pending: formatMessage(pendingRaw),
        accepted: formatMessage(acceptedRaw),
        rejected: formatMessage(rejectedRaw),
      });
    } catch (error) {
      console.error("Get Voice Notes Error:", error);
      return errorResponse(res, "Failed to fetch voice notes", 500);
    }
  },

  approveVoiceNote: async (req, res) => {
    try {
      const { id } = req.params;
  
      const message = await Messages.findById(id);
      if (!message || message.type !== "voice") {
        return errorResponse(res, "Voice note not found", 404);
      }
  
      message.approved = true;
      message.rejected = false; 
      message.reviewed = true;
      await message.save();
  
      return successResponse(res, "Voice note approved successfully");
    } catch (error) {
      console.error("Approve Voice Note Error:", error);
      return errorResponse(res, "Failed to approve voice note", 500);
    }
  },

  rejectVoiceNote: async (req, res) => {
    try {
      const { id } = req.params;
  
      const message = await Messages.findById(id);
      if (!message || message.type !== "voice") {
        return errorResponse(res, "Voice note not found", 404);
      }
  
      message.approved = false;
      message.rejected = true; 
      message.reviewed = true;
      await message.save();
  
      return successResponse(res, "Voice note rejected successfully");
    } catch (error) {
      console.error("Reject Voice Note Error:", error);
      return errorResponse(res, "Failed to reject voice note", 500);
    }
  },
  
  
  
  
};
