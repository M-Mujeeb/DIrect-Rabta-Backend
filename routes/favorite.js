const { Router } = require("express");
const router = Router();
const authPolicy = require("../middlewares/authenticated");
const controller = require("../controllers/favorite");

router.post("/toggle-favorite", authPolicy, controller.toggleFavoriteCelebrity);
router.get("/", authPolicy, controller.getFavoriteCelebrities);

module.exports = router;
