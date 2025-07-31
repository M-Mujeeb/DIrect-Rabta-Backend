const { Router } = require("express");
const router = Router();

// Routers
const userRouter = require("./user");
const favoriteRouter = require("./favorite");
const voiceRouter = require("./voice");
const celebrityRouter = require("./celebrity");
const adminRouter = require("./admin")



router.use('/v1/users', userRouter);
router.use("/v1/favorites", favoriteRouter);
router.use("/v1/voice", voiceRouter);
router.use("/v1/celebrities", celebrityRouter);

// Admin Portal APIS
router.use("/v1/admin", adminRouter)


module.exports = router;
