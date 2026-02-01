const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;

// Open SQLite database
let db;
try {
  db = new Database("collectwise.db");
} catch (err) {
  console.error("Failed to open database:", err);
  process.exit(1);
}

// Optional health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Account lookup by account number
app.get("/accounts/:accountNumber", (req, res) => {
  const { accountNumber } = req.params;

  try {
    const row = db
      .prepare("SELECT * FROM accounts WHERE account_number = ?")
      .get(accountNumber);

    if (!row) {
      return res.status(404).json({
        error: "Account not found",
        account_number: accountNumber
      });
    }

    return res.json(row);
  } catch (err) {
    console.error("Database query error:", err);
    return res.status(500).json({
      error: "Database error"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
