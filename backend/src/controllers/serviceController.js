const db = require("../config/db");

exports.getServices = async (req, res) => {
  try {
    const [services] = await db.query(
      "SELECT * FROM services WHERE is_active = 1",
    );
    res.json(services);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Could not fetch standard service array maps." });
  }
};

exports.getAllServicesAdmin = async (req, res) => {
  try {
    const [services] = await db.query("SELECT * FROM services ORDER BY id ASC");
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch service list." });
  }
};

exports.createService = async (req, res) => {
  const { name, description, price, duration_mins } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required." });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO services (name, description, price, duration_mins, is_active) VALUES (?, ?, ?, ?, 1)",
      [name, description || "", price, duration_mins || 30],
    );
    res.status(201).json({ message: "Service created.", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create service." });
  }
};

exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, duration_mins, is_active } = req.body;
  try {
    await db.query(
      "UPDATE services SET name = ?, description = ?, price = ?, duration_mins = ?, is_active = ? WHERE id = ?",
      [name, description, price, duration_mins || 30, is_active ? 1 : 0, id],
    );
    res.json({ message: "Service updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update service." });
  }
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM services WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Service not found." });
    }
    res.json({ message: "Service deleted." });
  } catch (err) {
    if (
      err.code === "ER_ROW_IS_REFERENCED_2" ||
      err.code === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        error:
          "This service has existing bookings and can't be deleted. Deactivate it instead.",
      });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to delete service." });
  }
};
