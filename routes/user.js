const { Router } = require("express");
const router = Router();

// Middlewares
const authPolicy = require("../middlewares/authenticated");

// Controllers
const controller = require("../controllers/user");


// Routes

router.post("/sign-up", controller.addUser);
router.post("/verify-user", controller.verifyUser);
router.post("/resend-otp", controller.resendOTP);
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/createPreferences",authPolicy ,controller.userPrefrences);
router.post("/googleLogin",controller.googleVerify)
router.post("/appleLogin",controller.appleLogin)
router.put("/update-profile", authPolicy, controller.updateProfile);
router.get("/getPreference",authPolicy,controller.userArtists)



module.exports = router;
