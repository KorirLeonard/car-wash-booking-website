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
