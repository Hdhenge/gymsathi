const express = require("express");
const router = express.Router();

const { addMember, getMembers, updateMember, deleteMember, markAttendance, updateAttendance, getMemberAttendance } = require("../controllers/memberController");
const { protect } = require("../middleware/authMiddleware");
const { adminOrOwner, adminOrOwnerOrTrainer } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const schemas = require("../validators/schemas");

router.post("/add", protect, adminOrOwnerOrTrainer, validate(schemas.memberCreate), addMember);
router.get("/", protect, getMembers);
router.put("/:id", protect, adminOrOwnerOrTrainer, validate(schemas.memberUpdate), updateMember);
router.delete("/:id", protect, adminOrOwner, deleteMember);

// Attendance routes
router.post("/:id/attendance", protect, adminOrOwnerOrTrainer, validate(schemas.attendanceCreate), markAttendance);
router.put("/:id/attendance/:attendanceId", protect, adminOrOwnerOrTrainer, validate(schemas.attendanceUpdate), updateAttendance);
router.get("/:id/attendance", protect, getMemberAttendance);

module.exports = router;
