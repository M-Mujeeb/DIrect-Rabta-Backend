const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const Users = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");
const UserPlan = require("../models/UserPlan");
const mongoose = require("mongoose");
const Message = require("../models/Message")

module.exports = {

getAllChatsForFan: async (req, res) => {
  try {
    const fanId = req.user.id;
    const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

    const messages = await Message.aggregate([
      {
        $match: {
          sender_id: new mongoose.Types.ObjectId(fanId),
          type: "voice"
        }
      },
      {
        $sort: { sent_at: -1 }
      },
      {
        $group: {
          _id: "$receiver_id",
          lastMessageAt: { $first: "$sent_at" },
          lastMessageUrl: { $first: "$content" },
          lastMessageDuration: { $first: "$duration" } 
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "celebrity"
        }
      },
      { $unwind: "$celebrity" },
      {
        $project: {
          celebrity_id: "$_id",
          name: "$celebrity.name",
          profile_image: {
            $concat: [BASE_URL, "$celebrity.profile_image"]
          },
          lastMessageAt: 1,
          lastMessageUrl: {
            $cond: {
              if: { $ne: ["$lastMessageUrl", null] },
              then: { $concat: [BASE_URL, "$lastMessageUrl"] },
              else: null
            }
          },
          lastMessageDuration: 1 
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    return successResponse(res, "Chats fetched successfully", messages);
  } catch (err) {
    console.error("Chat list error:", err);
    return errorResponse(res, "Failed to fetch chats", 500);
  }
},

getMessagesWithCelebrity: async (req, res) => {
  try {
    const fanId = req.user.id;
    const { celebrityId } = req.params;
    const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

    const messages = await Message.find({
      $or: [
        { sender_id: fanId, receiver_id: celebrityId },
        { sender_id: celebrityId, receiver_id: fanId }
      ]
    }).sort({ sent_at: 1 });

    const formatted = messages.map(msg => ({
      _id: msg._id,
      type: msg.type, // "voice" or "preset_text"
      content:
        msg.type === "voice"
          ? `${BASE_URL}${msg.content}`
          : msg.content,
      duration: msg.duration || 0,
      waveform: msg.type === "voice" ? msg.waveform || [] : [],
      sent_at: msg.sent_at,
      isMine: String(msg.sender_id) === String(fanId),
      approved: msg.approved || false,
    }));

    return successResponse(res, "Chat messages fetched", formatted);
  } catch (err) {
    console.error("Message thread error:", err);
    return errorResponse(res, "Failed to fetch messages", 500);
  }
},

  sendVoiceMessage: async (req, res) => {
 try {
    const fanId = req.user.id;
    const { celebrityId, duration } = req.body;

    if (!celebrityId) return errorResponse(res, "Celebrity ID is required", 400);
    if (!req.file) return errorResponse(res, "Voice note file is required", 400);

    const fan = await Users.findById(fanId).populate("role_id");
    const celebrity = await Users.findById(celebrityId).populate("role_id");

    if (!fan || fan.role_id.name !== "fan") {
      return errorResponse(res, "Only fans can send messages", 403);
    }

    if (!celebrity || celebrity.role_id.name !== "celebrity") {
      return errorResponse(res, "Celebrity not found", 404);
    }

    const userPlan = await UserPlan.findOne({
      user_id: fanId,
      remaining_messages: { $gt: 0 },
    });

    if (!userPlan) {
      return errorResponse(res, "No valid plan or message limit exceeded", 403);
    }

    // Local file paths
    const uploadsFolder = path.resolve(__dirname, "../uploads").replace(/\\/g, "/"); // Make it Docker-safe
    const fileName = req.file.filename;
    const audioFile = `/data/${fileName}`;
    const outputJsonFile = `/data/${fileName}.json`;
    const localJsonPath = path.join(uploadsFolder, `${fileName}.json`);

    const dockerCommand = `docker run --rm -v "${uploadsFolder}:/data" ghcr.io/bbc/audiowaveform -i "${audioFile}" -o "${outputJsonFile}" --pixels-per-second 10 --bits 8`;

    // Run audiowaveform inside Docker
    exec(dockerCommand, async (err) => {
      let waveform = [];

      if (err) {
        console.error("Waveform generation error:", err);
        // Optional: fallback dummy waveform
        waveform = Array.from({ length: 100 }, () => Math.floor(Math.random() * 20));
      } else {
        try {
          const jsonData = JSON.parse(fs.readFileSync(localJsonPath, "utf8"));
          waveform = jsonData.data || [];
        } catch (jsonErr) {
          console.error("Error reading waveform JSON:", jsonErr);
          waveform = [];
        }
      }

      // Save the message
      const newMsg = new Message({
        sender_id: fanId,
        receiver_id: celebrityId,
        type: "voice",
        content: `/uploads/${fileName}`,
        duration: Number(duration) || 0,
        sent_at: new Date(),
        reviewed: false,
        waveform,
        approved:false,
        rejected:false
      });

      await newMsg.save();

      userPlan.remaining_messages -= 1;
      await userPlan.save();

      return successResponse(res, "Voice message sent successfully", {
        voice_url: `${process.env.BASE_URL}/uploads/${fileName}`,
        waveform,
        remaining_messages: userPlan.remaining_messages,
      });
    });
  } catch (error) {
    console.error("Send Voice Error:", error);
    return errorResponse(res, "Failed to send voice message", 500);
  }
}

};