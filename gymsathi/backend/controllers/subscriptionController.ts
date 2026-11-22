const Subscription = require("../models/Subscription");

exports.createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ ownerId: req.user.id });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, ownerId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subscription) return res.status(404).json({ msg: "Subscription not found" });
    res.json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findOneAndDelete({ _id: id, ownerId: req.user.id });
    if (!subscription) return res.status(404).json({ msg: "Subscription not found" });
    res.json({ msg: "Subscription deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
