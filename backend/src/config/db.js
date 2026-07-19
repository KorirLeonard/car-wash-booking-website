const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verify connection immediately on boot
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Database Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Database Connected Successfully!");
    connection.release();
  }
});

module.exports = pool.promise();
