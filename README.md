# CollectWise – Account Lookup Prototype

## Overview

This prototype enables account lookup by **account number** using a lightweight SQLite database and a Node.js API.
It supports periodic CSV ingestion and exposes a REST endpoint that an AI agent can call in real time.

This solution is intentionally simple and optimized for clarity and ease of review.

---

## Project Structure

```
collectwise-prototype/
├─ db/               # Database schema / initialization
├─ ingest/           # CSV ingestion script
├─ server/           # Express API server
├─ data/             # Sample CSV (atlas_inventory.csv)
├─ package.json
├─ README.md
```

---

## Local Development & Testing

This path is for reviewers who want to run the project locally.

### Setup

```bash
npm install
npm run init-db
npm run ingest
```

### Start the server

```bash
npm start
```

The API will be available at:

```
http://localhost:3000
```

### Example request

```bash
curl http://localhost:3000/accounts/ACC-10001
```

### 404 behavior

If an account does not exist, the API returns a 404:

```bash
curl -i http://localhost:3000/accounts/ACC-99999
```

```json
{
  "error": "Account not found",
  "account_number": "ACC-99999"
}
```

---

## Public API (Deployed)

This path is for reviewers who want to test the deployed service directly.

The API is deployed to a public endpoint and is accessible without any local setup.

### Example public request

```bash
curl https://collectwise-atlas.onrender.com/accounts/ACC-10001
```

- The AI agent can call this endpoint directly during calls.
- CSV ingestion is performed at deployment time to populate the database.
- No local environment or server is required to test the public API.

---

## CSV Assumptions & Validation

- Required columns:
  - `account_number` (unique, required)
  - `debtor_name`
  - `phone_number`
  - `balance` (numeric)
  - `status`
  - `client_name`
- Rows missing `account_number` or with invalid `balance` are skipped
- Duplicate `account_number` rows overwrite existing records
- Ingestion reports counts of new, updated, and skipped rows

---

## Tradeoffs & Production Considerations

This implementation is designed as a **prototype**, not a full production system.

### Current tradeoffs

- **SQLite** is used to minimize setup and keep the prototype lightweight
- Database state may reset if the service restarts (depending on hosting environment)
- No authentication or authorization is included
- CSV ingestion is triggered manually or at deploy time

### Production-ready improvements

For a production deployment, the following changes would be recommended:

- Replace SQLite with **Postgres** for persistence, concurrency, and scaling
- Add authentication (API keys or service tokens) for the lookup endpoint
- Add a secure `POST /ingest` endpoint or scheduled ingestion pipeline
- Add structured logging and monitoring
- Add indexing on frequently queried fields (e.g., `account_number`, `phone_number`)

These changes can be made without altering the core API contract.

---
