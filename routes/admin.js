const { Router } = require("express");
const router = Router();


// Middlewares
const authPolicy = require("../middlewares/authenticated");

// Controllers
const controller = require("../controllers/admin");

router.post("/login", controller.login);
router.get("/customers", authPolicy, controller.getAllCustomers)
router.get("/celebrities", authPolicy, controller.getAllCelebrities)
router.get("/plans", authPolicy, controller.getAllPlans)




module.exports = router;