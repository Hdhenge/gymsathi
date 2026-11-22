const User = require("../models/User");
const Gym = require("../models/Gym");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const redisClient = require("../config/redis");

exports.register = async (req, res) => {
  try {
    const { name, email, password, gymName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let gymId = null;
    if (gymName) {
      const gym = await Gym.create({ gymName, gymEmail: email, gymPassword: hashedPassword, ownerId: null });
      gymId = gym._id;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "owner",
      gymId
    });

    if (gymId) {
      await Gym.findByIdAndUpdate(gymId, { ownerId: user._id });
    }

    const token = jwt.sign({ id: user._id, role: user.role, gymId: user.gymId }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role, gymId: user.gymId }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token) {
      return res.status(400).json({ msg: "No token found" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyError) {
      return res.status(400).json({ msg: "Invalid token" });
    }

    if (!payload || !payload.exp) {
      return res.status(400).json({ msg: "Invalid token payload" });
    }

    if (redisClient.isReady) {
      await redisClient.set(`token:${token}`, "Blocked");
      await redisClient.expireAt(`token:${token}`, payload.exp);
    }

    res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("gymId", "gymName gymEmail gymAddress gymPhone");
    res.json(users.map(publicUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const filter = req.user.role === "admin"
      ? { _id: id }
      : id === req.user.id
        ? { _id: id }
        : { _id: id, gymId: req.user.gymId, role: "trainer" };
    const user = await User.findOneAndUpdate(filter, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ msg: "User not found in this workspace" });
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTrainer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "trainer",
      gymId: req.user.gymId,
      createdBy: req.user.id
    });

    res.status(201).json({ msg: "Trainer created", trainer: publicUser(trainer) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = req.user.role === "admin"
      ? { _id: id }
      : { _id: id, gymId: req.user.gymId, role: "trainer" };
    const user = await User.findOneAndDelete(filter);
    if (!user) return res.status(404).json({ msg: "User not found in this workspace" });
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function publicUser(user) {
  const value = user.toObject();
  delete value.password;
  return value;
}
