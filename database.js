const Database = require("better-sqlite3");
const db = new Database("war_thunder.db");

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nation TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Ground','Aircraft','Naval')),
    battle_rating REAL NOT NULL,
    rank INTEGER NOT NULL,
    role TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const count = db.prepare("SELECT COUNT(*) AS count FROM vehicles").get().count;
if (count === 0) {
  const insert = db.prepare(`INSERT INTO vehicles
    (name,nation,type,battle_rating,rank,role,notes) VALUES (?,?,?,?,?,?,?)`);
  const seed = [
    ["M4A3E2 Jumbo","USA","Ground",5.3,3,"Heavy Tank","Example record — edit or delete me."],
    ["Tiger H1","Germany","Ground",5.7,3,"Heavy Tank","Example record — edit or delete me."],
    ["T-34-85","USSR","Ground",5.7,4,"Medium Tank","Example record — edit or delete me."],
    ["P-51D- Mustang","USA","Aircraft",5.0,4,"Fighter","Example record — edit or delete me."],
    ["Spitfire Mk IX","Great Britain","Aircraft",5.7,4,"Fighter","Example record — edit or delete me."],
    ["Fletcher","USA","Naval",3.3,2,"Destroyer","Example record — edit or delete me."]
  ];
  const insertMany = db.transaction(rows => rows.forEach(row => insert.run(...row)));
  insertMany(seed);
}
module.exports = db;
