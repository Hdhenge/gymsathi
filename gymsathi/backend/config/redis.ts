const { createClient } = require('redis');

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    reconnectStrategy(retries) {
      if (retries > 3) return new Error("Redis connection unavailable");
      return 500;
    },
  },
});

redisClient.on("error", (error) => console.warn("Redis connection error:", error.message));

module.exports = redisClient;
