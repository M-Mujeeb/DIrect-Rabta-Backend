const { Router } = require("express");
const router = Router();
const authPolicy = require("../middlewares/authenticated");
const controller = require("../controllers/voice");
const upload = require("../utils/multer");


router.get("/chats", authPolicy,  controller.getAllChatsForFan );
router.get("/messages/:celebrityId", authPolicy,  controller.getMessagesWithCelebrity  );
router.post("/send-voice", authPolicy, upload.single("voice_note"), controller.sendVoiceMessage);

module.exports = router;
