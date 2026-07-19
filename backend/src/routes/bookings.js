const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", bookingController.createBooking);
router.get("/admin/all", authMiddleware, bookingController.getAllBookingsAdmin);
router.put("/status", authMiddleware, bookingController.updateBookingStatus);

module.exports = router;
