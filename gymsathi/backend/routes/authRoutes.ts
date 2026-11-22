const express = require("express");
const router = express.Router();

const { register, login,logout, getUsers, updateUser, deleteUser, createTrainer } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { ownerOnly, adminOnly, adminOrOwner } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");


router.post("/register", validate(schemas.register), register);
router.post("/login", validate(schemas.login), login);
router.post("/logout",logout);
router.post("/trainer", protect, ownerOnly, validate(schemas.trainerCreate), createTrainer);
router.get("/", protect, adminOnly, getUsers);
router.put("/:id", protect, validate(schemas.userUpdate), updateUser);
router.delete("/:id", protect, adminOrOwner, deleteUser);

module.exports = router;
