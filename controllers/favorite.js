const Users = require("../models/User");
const Role = require("../models/Role");
const { successResponse, errorResponse } = require("../utils/response");

module.exports = {

   toggleFavoriteCelebrity: async (req, res) => {
    try {
      const fanId = req.user.id;
      const { celebrityId } = req.body;

      const fan = await Users.findById(fanId);
      const celebrity = await Users.findById(celebrityId);

      if (!fan || !celebrity || celebrity.role_id.toString() === fan.role_id.toString()) {
        return errorResponse(res, "Invalid fan or celebrity", 400);
      }

      const isFavorited = fan.favorites?.includes(celebrityId);

      const update = isFavorited
        ? { $pull: { favorites: celebrityId } }
        : { $addToSet: { favorites: celebrityId } };

      await Users.findByIdAndUpdate(fanId, update, { new: true });

      return successResponse(res, isFavorited ? "Removed from favorites" : "Added to favorites");
    } catch (err) {
      console.error("Toggle Favorite Error:", err);
      return errorResponse(res, "Failed to toggle favorite", 500);
    }
  },

  getFavoriteCelebrities: async (req, res) => {
    try {
      const fan = await Users.findById(req.user.id)
        .populate("favorites", "name profile_image celebrity_type about");

      if (!fan) return errorResponse(res, "User not found", 404);

      return successResponse(res, "Favorite celebrities fetched", fan.favorites);
    } catch (err) {
      console.error("Get Favorites Error:", err);
      return errorResponse(res, "Failed to fetch favorites", 500);
    }
  },

};