const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tenants Table
      db.run(`
        CREATE TABLE IF NOT EXISTS tenants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Widgets Table
      db.run(`
        CREATE TABLE IF NOT EXISTS widgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tenant_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          config_json TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (tenant_id) REFERENCES tenants (id)
        )
      `);

      // Submissions Table
      db.run(`
        CREATE TABLE IF NOT EXISTS submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          widget_id INTEGER NOT NULL,
          payload_json TEXT NOT NULL,
          ip_address TEXT,
          geo_data_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (widget_id) REFERENCES widgets (id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

module.exports = { db, initDb };
