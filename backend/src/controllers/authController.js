const bcrypt = require("bcryptjs");
const db = require("../config/db");

const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (users.length === 0)
      return res.status(400).json({ error: "Invalid security credentials." });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid security credentials." });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );
    res.json({ token, message: "Authentication verification success." });
  } catch (err) {
    console.error(err);
    res
      .status(500)

      .json({ error: "Internal system fault during login transaction." });
  }
};
