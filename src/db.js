/**
 * SQLite database for storing WhatsApp credentials
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.WHATSAPP_BRIDGE_DB || path.join(
  process.env.HOME || '/tmp',
  '.whatsapp-bridge',
  'credentials.db'
);

let db = null;

function getDb() {
  if (db) return db;

  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      name TEXT PRIMARY KEY,
      phone TEXT,
      credentials TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_connected TEXT
    );
  `);

  return db;
}

function saveAccount(name, phone, credentials) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO accounts (name, phone, credentials, last_connected)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `);
  stmt.run(name, phone, JSON.stringify(credentials));
}

function getAccount(name) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM accounts WHERE name = ?');
  const row = stmt.get(name);
  if (row) {
    row.credentials = JSON.parse(row.credentials);
  }
  return row;
}

function getAllAccounts() {
  const db = getDb();
  const stmt = db.prepare('SELECT name, phone, created_at, last_connected FROM accounts');
  return stmt.all();
}

function deleteAccountDb(name) {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM accounts WHERE name = ?');
  return stmt.run(name);
}

function updateLastConnected(name) {
  const db = getDb();
  const stmt = db.prepare('UPDATE accounts SET last_connected = CURRENT_TIMESTAMP WHERE name = ?');
  stmt.run(name);
}

module.exports = {
  getDb,
  saveAccount,
  getAccount,
  getAllAccounts,
  deleteAccount: deleteAccountDb,
  updateLastConnected,
  DB_PATH
};
