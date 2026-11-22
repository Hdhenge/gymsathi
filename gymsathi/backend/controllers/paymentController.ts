const Payment = require("../models/Payment");
const Member = require("../models/Member");

exports.addPayment = async (req, res) => {
  try {
    const { memberId, amount, paymentType, note } = req.body;
    const member = await Member.findOne({ _id: memberId, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ msg: "Member not found in this gym" });

    const balance = Math.max(member.totalFees - member.paidAmount, 0);
    if (amount > balance) return res.status(400).json({ msg: `Payment exceeds the outstanding balance of ${balance}.` });

    member.paidAmount += amount;
    member.remainingAmount = member.totalFees - member.paidAmount;
    await member.save();

    try {
      const payment = await Payment.create({
        memberId,
        amount,
        paymentType,
        note,
        collectedBy: req.user.id,
        gymId: req.user.gymId,
      });
      return res.status(201).json(payment);
    } catch (error) {
      member.paidAmount -= amount;
      member.remainingAmount = member.totalFees - member.paidAmount;
      await member.save();
      throw error;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ gymId: req.user.gymId })
      .populate("memberId", "name phone")
      .populate("collectedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, gymId: req.user.gymId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ msg: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, gymId: req.user.gymId });
    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    const member = await Member.findOne({ _id: payment.memberId, gymId: req.user.gymId });
    if (member) {
      member.paidAmount = Math.max(member.paidAmount - payment.amount, 0);
      member.remainingAmount = member.totalFees - member.paidAmount;
      await member.save();
    }
    res.json({ msg: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
