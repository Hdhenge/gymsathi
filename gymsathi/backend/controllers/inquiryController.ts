const Inquiry = require("../models/Inquiry");

exports.addInquiry = async (req, res) => {
  try {
    const { name, phone, email, goal, source, status, followUpDate, notes } = req.body;

    const inquiry = await Inquiry.create({
      name,
      phone,
      email,
      goal,
      source,
      status,
      followUpDate: followUpDate || null,
      notes,
      gymId: req.user.gymId,
      addedBy: req.user.id,
    });

    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ gymId: req.user.gymId }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(payload, "followUpDate") && !payload.followUpDate) {
      payload.followUpDate = null;
    }

    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: id, gymId: req.user.gymId },
      payload,
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ msg: "Inquiry not found" });
    }

    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findOneAndDelete({ _id: id, gymId: req.user.gymId });
    if (!inquiry) {
      return res.status(404).json({ msg: "Inquiry not found" });
    }

    res.json({ msg: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
