const express = require("express");
const router = express.Router();

const { createSubscription, getSubscriptions, updateSubscription, deleteSubscription } = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

router.post("/", protect, validate(schemas.subscriptionCreate), createSubscription);
router.get("/", protect, getSubscriptions);
router.put("/:id", protect, validate(schemas.subscriptionUpdate), updateSubscription);
router.delete("/:id", protect, deleteSubscription);

module.exports = router;
