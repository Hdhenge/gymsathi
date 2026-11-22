const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/gyms", require("./routes/gymRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/inquiries", require("./routes/inquiryRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));

module.exports = app;
