const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
});
console.log(
  "Loaded JWT Secret:",
  process.env.JWT_SECRET ? "SUCCESS" : "FAILED - Secret is missing!",
);

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const serviceRoutes = require("./routes/services");

const app = express();

// Global Cross-Origin Resource Sharing and JSON Body Parsing Engine
app.use(cors());
app.use(express.json());

// API Route Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server executing operations efficiently on port ${PORT}`);
});
// Add this at the very bottom to catch silent crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ CRITICAL UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ CRITICAL UNCAUGHT EXCEPTION:", error);
});
