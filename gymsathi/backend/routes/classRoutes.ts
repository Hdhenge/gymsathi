const express = require("express");
const router = express.Router();
const { getClasses, createClass, deleteClass, bookClass, cancelClassBooking } = require("../controllers/classController");
const { protect } = require("../middleware/authMiddleware");
const { adminOrOwnerOrTrainer } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

router.get("/", protect, getClasses);
router.post("/", protect, adminOrOwnerOrTrainer, validate(schemas.classCreate), createClass);
router.delete("/:id", protect, adminOrOwnerOrTrainer, deleteClass);
router.post("/:id/bookings", protect, adminOrOwnerOrTrainer, validate(schemas.classBooking), bookClass);
router.delete("/:id/bookings/:memberId", protect, adminOrOwnerOrTrainer, cancelClassBooking);

module.exports = router;
