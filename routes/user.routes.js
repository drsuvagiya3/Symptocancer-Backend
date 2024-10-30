const express = require("express")
const router = express.Router()
const { userController } = require("../controllers")
const { validate4login, validate4register, validate4predict } = require("../utils/validation/joi.validate")

router.get("/history/:user", userController.getHistory)
router.get("/profile", userController.getProfile)

router.post("/register", validate4register, userController.register)
router.post("/login", validate4login, userController.login)
router.post("/predict", validate4predict, userController.predictDisease)

module.exports = router