const Database = require("better-sqlite3");
const db = new Database("collectwise.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS accounts (
    account_number TEXT PRIMARY KEY,
    debtor_name TEXT,
    phone_number TEXT,
    balance REAL,
    status TEXT,
    client_name TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.close();
console.log("Database initialized.");
