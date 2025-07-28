const { Router } = require("express");
const router = Router();

// Routers
const userRouter = require("./user");
const favoriteRouter = require("./favorite");
const voiceRouter = require("./voice");
const celebrityRouter = require("./celebrity");



router.use('/v1/users', userRouter);
router.use("/v1/favorites", favoriteRouter);
router.use("/v1/voice", voiceRouter);
router.use("/v1/celebrities", celebrityRouter);



module.exports = router;
