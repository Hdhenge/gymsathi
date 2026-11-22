const express = require("express");
const router = express.Router();

const {
  addInquiry,
  getInquiries,
  updateInquiry,
  deleteInquiry,
} = require("../controllers/inquiryController");
const { protect } = require("../middleware/authMiddleware");
const { adminOrOwner, adminOrOwnerOrTrainer } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

router.post("/add", protect, adminOrOwnerOrTrainer, validate(schemas.inquiryCreate), addInquiry);
router.get("/", protect, adminOrOwnerOrTrainer, getInquiries);
router.put("/:id", protect, adminOrOwnerOrTrainer, validate(schemas.inquiryUpdate), updateInquiry);
router.delete("/:id", protect, adminOrOwner, deleteInquiry);

module.exports = router;
