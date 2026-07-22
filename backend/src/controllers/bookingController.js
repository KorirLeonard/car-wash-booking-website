const db = require("../config/db");
const { sendApprovalEmail } = require("../utils/mailer");
const { notifyNewBooking, notifyFailedLogins } = require("../utils/notifier");

exports.createBooking = async (req, res) => {
  const {
    name,
    phone,
    email,
    vehicle_type,
    registration_number,
    service_id,
    booking_date,
    booking_time,
  } = req.body;

  // Server-side Input Validation Formats
  if (
    !name ||
    !phone ||
    !email ||
    !registration_number ||
    !service_id ||
    !booking_date ||
    !booking_time
  ) {
    return res
      .status(400)
      .json({ error: "All fields are mandatory to clear verification." });
  }

  try {
    // Atomic transaction sequence simulator safely over pool
    // 1. Resolve or create customer index node
    let [customers] = await db.query(
      "SELECT id FROM customers WHERE email = ?",
      [email],
    );
    let customerId;
    if (customers.length === 0) {
      const [newCust] = await db.query(
        "INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)",
        [name, phone, email],
      );
      customerId = newCust.insertId;
    } else {
      customerId = customers[0].id;
    }

    // 2. Resolve or create vehicle configuration binding mapping
    let [vehicles] = await db.query(
      "SELECT id FROM vehicles WHERE registration_number = ?",
      [registration_number],
    );
    let vehicleId;
    if (vehicles.length === 0) {
      const [newVeh] = await db.query(
        "INSERT INTO vehicles (customer_id, vehicle_type, registration_number) VALUES (?, ?, ?)",
        [customerId, vehicle_type, registration_number],
      );
      vehicleId = newVeh.insertId;
    } else {
      vehicleId = vehicles[0].id;
    }

    // 3. Inject terminal scheduling entry point node
    const [booking] = await db.query(
      "INSERT INTO bookings (customer_id, vehicle_id, service_id, booking_date, booking_time) VALUES (?, ?, ?, ?, ?)",
      [customerId, vehicleId, service_id, booking_date, booking_time],
    );

    // Fetch service name for the notification (kept lightweight, not required for booking itself)
    const [serviceRows] = await db.query(
      "SELECT name FROM services WHERE id = ?",
      [service_id],
    );
    const serviceName = serviceRows[0]?.name || "a service";

    notifyNewBooking({
      name,
      serviceName,
      date: booking_date,
      time: booking_time,
    }).catch((err) => console.error("New booking notification failed:", err));

    res.status(201).json({
      message: "Booking verified and structured.",
      bookingId: booking.insertId,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Database pipeline validation engine failure." });
  }
};

exports.getAllBookingsAdmin = async (req, res) => {
  try {
    const [data] = await db.query(`
            SELECT b.id, b.booking_date, b.booking_time, b.status,
                   c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
                   v.vehicle_type, v.registration_number,
                   s.name AS service_name, s.price
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            JOIN vehicles v ON b.vehicle_id = v.id
            JOIN services s ON b.service_id = s.id
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `);
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to extract system state registers." });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  try {
    await db.query("UPDATE bookings SET status = ? WHERE id = ?", [
      status,
      bookingId,
    ]);

    if (status === "Confirmed") {
      const [rows] = await db.query(
        `SELECT c.name, c.email, s.name AS service_name, b.booking_date, b.booking_time
         FROM bookings b
         JOIN customers c ON b.customer_id = c.id
         JOIN services s ON b.service_id = s.id
         WHERE b.id = ?`,
        [bookingId],
      );
      if (rows.length > 0) {
        const b = rows[0];
        sendApprovalEmail(
          b.email,
          b.name,
          b.service_name,
          b.booking_date,
          b.booking_time,
        ).catch((err) => console.error("Email send failed:", err));
      }
    }

    res.json({ message: "Operational entity state successfully updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update workflow state." });
  }
};

exports.deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM bookings WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found." });
    }
    res.json({ message: "Booking deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete booking." });
  }
};
