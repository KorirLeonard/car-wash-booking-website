const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// Dummy hash used to keep response timing consistent when no user is found
const DUMMY_HASH =
  "$2a$10$CwTycUXWue0Thq9StjUM0uJ8vqQvo7q4t6uNeq2vhKmYq0YO3Xle2";

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // --- Input validation ---
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 3 || trimmedUsername.length > 32) {
    return res.status(400).json({ error: "Invalid security credentials." });
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUsername)) {
    return res.status(400).json({ error: "Invalid security credentials." });
  }

  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Invalid security credentials." });
  }

  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      trimmedUsername,
    ]);

    const user = users[0];

    // Always run bcrypt.compare, even if user doesn't exist, to prevent timing attacks
    const isMatch = await bcrypt.compare(
      password,
      user ? user.password : DUMMY_HASH,
    );

    if (!user || !isMatch) {
      return res.status(400).json({ error: "Invalid security credentials." });
    }

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
