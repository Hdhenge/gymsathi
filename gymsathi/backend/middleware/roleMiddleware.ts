const ownerOnly = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ msg: 'Access denied: Owner only' });
  }
  next();
};

const trainerOnly = (req, res, next) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).json({ msg: 'Access denied: Trainer only' });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admin only' });
  }
  next();
};

const adminOrOwner = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "owner") {
    next();
  } else {
    res.status(403).json({ msg: "Access denied" });
  }
};

const adminOrOwnerOrTrainer = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "owner" || req.user.role === "trainer") {
    next();
  } else {
    res.status(403).json({ msg: "Access denied" });
  }
};

module.exports = { adminOrOwner, ownerOnly, trainerOnly, adminOnly, adminOrOwnerOrTrainer };
