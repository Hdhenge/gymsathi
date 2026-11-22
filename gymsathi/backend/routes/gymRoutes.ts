const express = require("express");
const router = express.Router();

const { createGym, getGyms, updateGym, deleteGym } = require("../controllers/gymController");
const { protect} = require("../middleware/authMiddleware");
const { ownerOnly } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const Joi = require("joi");

const gymCreateSchema = Joi.object({
  gymName: Joi.string().trim().min(2).max(100).required(),
  gymEmail: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  gymPassword: Joi.string().min(8).max(128).required(),
  gymAddress: Joi.string().trim().max(180).allow(""),
  gymPhone: Joi.string().trim().max(24).allow(""),
  monthlyFee: Joi.number().min(0),
  yearlyFee: Joi.number().min(0),
});

const gymUpdateSchema = Joi.object({
  gymName: Joi.string().trim().min(2).max(100),
  gymEmail: Joi.string().trim().lowercase().email({ tlds: { allow: false } }),
  gymAddress: Joi.string().trim().max(180).allow(""),
  gymPhone: Joi.string().trim().max(24).allow(""),
  monthlyFee: Joi.number().min(0),
  yearlyFee: Joi.number().min(0),
}).min(1);

router.post("/", protect, ownerOnly, validate(gymCreateSchema), createGym);
router.get("/", protect, getGyms);
router.put("/:id", protect, ownerOnly, validate(gymUpdateSchema), updateGym);
router.delete("/:id", protect, ownerOnly, deleteGym);

module.exports = router;
