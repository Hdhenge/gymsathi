const Member = require("../models/Member");
const Payment = require("../models/Payment");

exports.addMember = async (req, res) => {
  try {
    const { name, phone, email, totalFees, plan, startDate, endDate, paidAmount = 0, trainer = "", goal = "" } = req.body;

    const member = await Member.create({
      name,
      phone,
      email,
      trainer,
      goal,
      totalFees,
      paidAmount,
      remainingAmount: totalFees - paidAmount,
      plan,
      startDate,
      endDate,
      gymId: req.user.gymId,
      addedBy: req.user.id
    });

    if (paidAmount > 0) {
      await Payment.create({
        memberId: member._id,
        amount: paidAmount,
        paymentType: "cash",
        note: "Initial membership payment",
        collectedBy: req.user.id,
        gymId: req.user.gymId,
      });
    }

    res.status(201).json(member);
  } catch (err) {
    res.status(err.code === 11000 ? 409 : 500).json({ error: err.code === 11000 ? "A member with this phone number already exists in this gym." : err.message });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find({ gymId: req.user.gymId }).sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const updates = { ...req.body };
    if (updates.totalFees !== undefined || updates.paidAmount !== undefined) {
      const existing = await Member.findOne({ _id: id, gymId: req.user.gymId });
      if (!existing) return res.status(404).json({ msg: "Member not found" });
      const totalFees = updates.totalFees ?? existing.totalFees;
      const paidAmount = updates.paidAmount ?? existing.paidAmount;
      if (paidAmount > totalFees) return res.status(400).json({ msg: "Amount paid cannot exceed the membership fee." });
      updates.remainingAmount = totalFees - paidAmount;
    }

    const member = await Member.findOneAndUpdate(
      { _id: id, gymId: req.user.gymId }, // ✅ secure
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ msg: "Member not found" });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findOneAndDelete({ _id: id, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ msg: "Member not found" });
    res.json({ msg: "Member deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, checkInTime, status = "present" } = req.body;

    const memberExists = await Member.exists({ _id: id, gymId: req.user.gymId });
    if (!memberExists) return res.status(404).json({ msg: "Member not found" });
    const alreadyCheckedIn = await Member.exists({ _id: id, gymId: req.user.gymId, "attendance.date": date });
    if (alreadyCheckedIn) return res.status(409).json({ msg: "This member already has an attendance record for this date." });

    const member = await Member.findOneAndUpdate(
      { _id: id, gymId: req.user.gymId },
      {
        $push: {
          attendance: {
            date,
            checkInTime,
            status
          }
        }
      },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ msg: "Member not found" });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id, attendanceId } = req.params;
    const { checkOutTime, status } = req.body;

    const member = await Member.findOneAndUpdate(
      { _id: id, gymId: req.user.gymId, "attendance._id": attendanceId },
      {
        $set: {
          "attendance.$.checkOutTime": checkOutTime,
          "attendance.$.status": status
        }
      },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ msg: "Member or attendance record not found" });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMemberAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findOne({ _id: id, gymId: req.user.gymId }).select('attendance');

    if (!member) {
      return res.status(404).json({ msg: "Member not found" });
    }

    res.json(member.attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
