const Users = require("../models/User");
const Role = require("../models/Role");
const Message = require("../models/Message");
const mongoose = require("mongoose");

const { successResponse, errorResponse } = require("../utils/response");

module.exports = {
  getAllCelebrities: async (req, res) => {
    try {
      const celebrityRole = await Role.findOne({ name: "celebrity" });
      if (!celebrityRole) {
        return errorResponse(res, "Celebrity role not found", 404);
      }

      const celebrities = await Users.find({ role_id: celebrityRole._id })
        .select("name profile_image celebrity_type about");

      const BASE_URL = process.env.BASE_URL;

      const formatted = celebrities.map(c => ({
        id: c._id,
        name: c.name,
        celebrity_type: c.celebrity_type,
        about: c.about,
        profile_image: c.profile_image ? `${BASE_URL}${c.profile_image}` : ""
      }));

      return successResponse(res, "Celebrities fetched successfully", formatted);
    } catch (error) {
      console.error("Get Celebrities Error:", error);
      return errorResponse(res, "Failed to fetch celebrities", 500);
    }
  },

  getAllChatsForCelebrity: async (req, res) => {
  try {
    const celebrityId = req.user.id;
    const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

    const messages = await Message.aggregate([
      { $match: { receiver_id: new mongoose.Types.ObjectId(celebrityId), type: "voice" } },
      {
        $group: {
          _id: "$sender_id",
          lastMessageAt: { $last: "$sent_at" },
          lastDuration: { $last: "$duration" },
          lastContent: { $last: "$content" },
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "fan"
        }
      },
      { $unwind: "$fan" },
      {
        $project: {
          fan_id: "$_id",
          name: "$fan.name",
          profile_image: {
            $concat: [BASE_URL, "/uploads/", "$fan.profile_image"]
          },
          lastMessageAt: 1,
          lastDuration: 1,
          lastContent: 1
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    return successResponse(res, "Chats fetched successfully", messages);
  } catch (err) {
    console.error("Celebrity chat list error:", err);
    return errorResponse(res, "Failed to fetch chats", 500);
  }
  },

  getMessagesWithFan: async (req, res) => {
  try {
    const celebrityId = req.user.id;
    const { fanId } = req.params;
    const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

    const messages = await Message.find({
      $or: [
        { sender_id: celebrityId, receiver_id: fanId },
        { sender_id: fanId, receiver_id: celebrityId }
      ]
    }).sort({ sent_at: 1 });

    const formatted = messages.map(msg => ({
      ...msg.toObject(),
      isMine: String(msg.sender_id) === String(celebrityId),
      content: msg.type === "voice" && msg.content ? `${BASE_URL}${msg.content}` : msg.content
    }));

    return successResponse(res, "Messages fetched", formatted);
  } catch (err) {
    console.error("Celebrity message thread error:", err);
    return errorResponse(res, "Failed to fetch messages", 500);
  }
  },

  sendReplyToFan: async (req, res) => {
  try {
    const celebrityId = req.user.id;
    const { fanId, text } = req.body;

    if (!fanId || !text) {
      return errorResponse(res, "Fan ID and text are required", 400);
    }

    const newMsg = new Message({
      sender_id: celebrityId,
      receiver_id: fanId,
      type: "preset_text",
      content: text,
      sent_at: new Date(),
      reviewed: false,
    });

    await newMsg.save();

    return successResponse(res, "Reply sent successfully", newMsg);
  } catch (err) {
    console.error("Celebrity reply error:", err);
    return errorResponse(res, "Failed to send reply", 500);
  }
}




};