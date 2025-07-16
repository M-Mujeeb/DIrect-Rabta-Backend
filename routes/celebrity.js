const { Router } = require("express");
const router = Router();
const authPolicy = require("../middlewares/authenticated");
const controller = require("../controllers/celebrity");

router.get("/", authPolicy, controller.getAllCelebrities);
router.get("/chats", authPolicy, controller.getAllChatsForCelebrity);
router.get("/messages/:fanId", authPolicy, controller.getMessagesWithFan);
router.post("/reply", authPolicy, controller.sendReplyToFan);

module.exports = router;
