import Database from 'better-sqlite3';

const db = new Database('visits.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY,
    count INTEGER DEFAULT 0
  )
`);

const init = db.prepare(`
  INSERT OR IGNORE INTO visits (id, count) VALUES (1, 0)
`);
init.run();

export default db;