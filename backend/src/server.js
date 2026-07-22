const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");

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
const { setWss } = require("./utils/notifier");

const app = express();

// Trust the first hop of the reverse proxy (Render) so req.ip / X-Forwarded-For
// are read correctly by express-rate-limit and our own IP logging.
app.set("trust proxy", 1);

// Global Cross-Origin Resource Sharing and JSON Body Parsing Engine
app.use(cors());
app.use(express.json());

// API Route Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);

// Wrap express app in a plain HTTP server so we can attach a WebSocket server to it
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/api/notifications" });

wss.on("connection", (ws) => {
  console.log("Admin dashboard connected for live notifications.");
  ws.on("close", () => console.log("Admin dashboard disconnected."));
});

setWss(wss); // give the notifier module a reference so it can broadcast from anywhere

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server executing operations efficiently on port ${PORT}`);
});

// Add this at the very bottom to catch silent crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error(" CRITICAL UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (error) => {
  console.error(" CRITICAL UNCAUGHT EXCEPTION:", error);
});
