const ClassSession = require("../models/ClassSession");
const Member = require("../models/Member");

exports.getClasses = async (req, res) => {
  try {
    const classes = await ClassSession.find({ gymId: req.user.gymId }).populate("memberIds", "name").sort({ date: 1, startTime: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const item = await ClassSession.create({ ...req.body, gymId: req.user.gymId, createdBy: req.user.id, memberIds: [] });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const item = await ClassSession.findOneAndDelete({ _id: req.params.id, gymId: req.user.gymId });
    if (!item) return res.status(404).json({ msg: "Class not found" });
    res.json({ msg: "Class removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bookClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const member = await Member.exists({ _id: memberId, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ msg: "Member not found in this gym" });

    const item = await ClassSession.findOneAndUpdate(
      { _id: id, gymId: req.user.gymId, memberIds: { $ne: memberId }, $expr: { $lt: [{ $size: "$memberIds" }, "$capacity"] } },
      { $addToSet: { memberIds: memberId } },
      { new: true }
    ).populate("memberIds", "name");

    if (!item) {
      const existing = await ClassSession.findOne({ _id: id, gymId: req.user.gymId });
      if (!existing) return res.status(404).json({ msg: "Class not found" });
      if (existing.memberIds.some((entry) => String(entry) === String(memberId))) return res.status(409).json({ msg: "This member already has a spot in the class" });
      return res.status(409).json({ msg: "This class is full" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelClassBooking = async (req, res) => {
  try {
    const item = await ClassSession.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      { $pull: { memberIds: req.params.memberId } },
      { new: true }
    ).populate("memberIds", "name");
    if (!item) return res.status(404).json({ msg: "Class not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
