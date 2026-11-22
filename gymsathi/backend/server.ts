require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const redisClient = require("./config/redis");

// connectDB();

// app.listen(5000, () => console.log("Server running"));


const InitializeConnection = async () => {
  try {
    await connectDB();
    if (process.env.REDIS_HOST) {
      try {
        await redisClient.connect();
        console.log("Redis connected");
      } catch (err) {
        console.warn("Redis unavailable; token revocation is disabled for this run:", err.message);
      }
    }

    const port = Number(process.env.PORT) || 5000;
    const host = process.env.API_HOST || "127.0.0.1";
    app.listen(port, host, () => {
      console.log(`Listening at http://${host}:${port}`);
    });

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1); 
  }
};

InitializeConnection();
