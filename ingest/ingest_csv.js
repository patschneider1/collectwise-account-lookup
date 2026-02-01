const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const Database = require("better-sqlite3");

const CSV_PATH = path.join(__dirname, "../data/atlas_inventory.csv");
const db = new Database("collectwise.db");

let inserted = 0;
let updated = 0;
let skipped = 0;

// Prepare statements
const selectStmt = db.prepare(
  "SELECT 1 FROM accounts WHERE account_number = ?"
);

const upsertStmt = db.prepare(`
  INSERT INTO accounts (
    account_number,
    debtor_name,
    phone_number,
    balance,
    status,
    client_name,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(account_number) DO UPDATE SET
    debtor_name = excluded.debtor_name,
    phone_number = excluded.phone_number,
    balance = excluded.balance,
    status = excluded.status,
    client_name = excluded.client_name,
    updated_at = CURRENT_TIMESTAMP
`);

try {
  const file = fs.readFileSync(CSV_PATH);

  const records = parse(file, {
    columns: true,
    trim: true,
    skip_empty_lines: true
  });

  for (const row of records) {
    // Validation
    if (!row.account_number) {
      skipped++;
      continue;
    }

    const balance = parseFloat(row.balance);
    if (Number.isNaN(balance)) {
      skipped++;
      continue;
    }

    const exists = selectStmt.get(row.account_number);

    if (exists) updated++;
    else inserted++;

    upsertStmt.run(
      row.account_number,
      row.debtor_name || null,
      row.phone_number || null,
      balance,
      row.status || null,
      row.client_name || null
    );
  }

  console.log("CSV ingestion complete.");
  console.log(`New accounts added: ${inserted}`);
  console.log(`Accounts updated: ${updated}`);
  console.log(`Rows skipped: ${skipped}`);
} catch (err) {
  console.error("Error ingesting CSV:", err.message);
  process.exit(1);
} finally {
  db.close();
}
