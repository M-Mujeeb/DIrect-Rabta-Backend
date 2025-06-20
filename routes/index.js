const { Router } = require("express");
const router = Router();

// Routers
const userRouter = require("./user");


router.use('/v1/users', userRouter);


module.exports = router;
