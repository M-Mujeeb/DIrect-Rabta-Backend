const { Router } = require("express");
const router = Router();
const upload = require("../utils/multer");


// Middlewares
const authPolicy = require("../middlewares/authenticated");

// Controllers
const controller = require("../controllers/admin");

router.post("/login", controller.login);
router.get("/customers", authPolicy, controller.getAllCustomers)
router.get("/celebrities", authPolicy, controller.getAllCelebrities)
router.post("/celebrity", authPolicy,upload.single("profile_image"), controller.addCelebrity)
router.put("/celebrity/:id", authPolicy, upload.single("profile_image"), controller.updateCelebrity);
router.delete("/celebrity/:id", authPolicy, controller.deleteCelebrity);



router.get("/plans", authPolicy, controller.getAllPlans)
router.post("/plan", authPolicy, controller.addPlan)
router.put("/plan/:id", authPolicy, controller.updatePlan);
router.delete("/plan/:id", authPolicy, controller.deletePlan);





module.exports = router;