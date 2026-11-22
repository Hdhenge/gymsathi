const express = require("express");
const router = express.Router();

const { addPayment, getPayments, updatePayment, deletePayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { adminOrOwner, adminOrOwnerOrTrainer } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

router.post("/add", protect, adminOrOwnerOrTrainer, validate(schemas.paymentCreate), addPayment);
router.get("/", protect, getPayments);
router.put("/:id", protect, adminOrOwnerOrTrainer, validate(schemas.paymentUpdate), updatePayment);
router.delete("/:id", protect, adminOrOwner, deletePayment);

module.exports = router;
