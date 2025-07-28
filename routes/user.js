const { Router } = require("express");
const router = Router();


// Middlewares
const authPolicy = require("../middlewares/authenticated");

// Controllers
const controller = require("../controllers/user");

const upload = require("../utils/multer");


// Routes
router.post("/sign-up", controller.addUser);
router.post("/verify-user", controller.verifyUser);
router.post("/resend-otp", controller.resendOTP);
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/createPreferences", authPolicy, controller.userPrefrences);
router.post("/googleLogin", controller.googleVerify)
router.post("/appleLogin", controller.appleLogin)
router.put("/update-profile", authPolicy, upload.single("profile_image"), controller.updateProfile);
router.post("/change-password", authPolicy, controller.changePassword);
router.delete("/delete-account", authPolicy, controller.deleteAccount);
router.get("/payment-history", authPolicy, controller.getPaymentHistory);

// For testing
router.post("/increase-limit", authPolicy, controller.increaseLimit);

module.exports = router;
