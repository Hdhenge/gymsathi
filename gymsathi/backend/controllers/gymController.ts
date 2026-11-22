const Gym = require("../models/Gym");
const bcrypt = require("bcryptjs");

exports.createGym = async (req, res) => {
  try {
    const { gymName, gymEmail, gymPassword, monthlyFee, yearlyFee } = req.body;

    const hashedGymPassword = await bcrypt.hash(gymPassword, 10);

    const gym = await Gym.create({
      gymName,
      gymEmail,
      gymPassword: hashedGymPassword,
      monthlyFee,
      yearlyFee,
      ownerId: req.user.id
    });

    res.json(gym);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGyms = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? { ownerId: req.user.id } : { _id: req.user.gymId };
    const gyms = await Gym.find(filter).select("-gymPassword");
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGym = async (req, res) => {
  try {
    const { id } = req.params;
    const gym = await Gym.findOneAndUpdate(
      { _id: id, ownerId: req.user.id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    ).select("-gymPassword");
    if (!gym) return res.status(404).json({ msg: "Gym not found" });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGym = async (req, res) => {
  try {
    const { id } = req.params;
    const gym = await Gym.findOneAndDelete({ _id: id, ownerId: req.user.id });
    if (!gym) return res.status(404).json({ msg: "Gym not found" });
    res.json({ msg: "Gym deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
