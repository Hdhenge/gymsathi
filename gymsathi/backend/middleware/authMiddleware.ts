const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isBlocked = redisClient.isReady ? await redisClient.exists(`token:${token}`) : false;

    if (isBlocked) {
      return res.status(401).json({ msg: "Token is blocked" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
