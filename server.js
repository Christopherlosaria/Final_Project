const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const validTypes = ["Ground", "Aircraft", "Naval"];

app.get("/api/vehicles", (req, res) => {
  const { search = "", type = "All", nation = "All" } = req.query;
  let sql = "SELECT * FROM vehicles WHERE (name LIKE ? OR nation LIKE ?)";
  const params = [`%${search}%`, `%${search}%`];

  if (type !== "All") { sql += " AND type = ?"; params.push(type); }
  if (nation !== "All") { sql += " AND nation = ?"; params.push(nation); }

  sql += " ORDER BY name COLLATE NOCASE";
  res.json(db.prepare(sql).all(...params));
});

app.get("/api/stats", (req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS count FROM vehicles").get().count;
  const byType = db.prepare("SELECT type, COUNT(*) AS count FROM vehicles GROUP BY type").all();
  const nations = db.prepare("SELECT COUNT(DISTINCT nation) AS count FROM vehicles").get().count;
  const avgBR = db.prepare("SELECT ROUND(AVG(battle_rating), 1) AS value FROM vehicles").get().value || 0;
  res.json({ total, nations, avgBR, byType });
});

app.post("/api/vehicles", (req, res) => {
  const { name, nation, type, battle_rating, rank, role, notes } = req.body;
  if (!name || !nation || !validTypes.includes(type) || battle_rating === undefined || rank === undefined) {
    return res.status(400).json({ error: "Name, nation, valid type, battle rating, and rank are required." });
  }
  const br = Number(battle_rating), vehicleRank = Number(rank);
  if (!Number.isFinite(br) || br < 1 || br > 15 || !Number.isInteger(vehicleRank) || vehicleRank < 1 || vehicleRank > 8) {
    return res.status(400).json({ error: "Battle rating must be 1–15 and rank must be 1–8." });
  }
  const result = db.prepare(
    "INSERT INTO vehicles (name,nation,type,battle_rating,rank,role,notes) VALUES (?,?,?,?,?,?,?)"
  ).run(name.trim(), nation.trim(), type, br, vehicleRank, role || "", notes || "");
  res.status(201).json(db.prepare("SELECT * FROM vehicles WHERE id = ?").get(result.lastInsertRowid));
});

app.put("/api/vehicles/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, nation, type, battle_rating, rank, role, notes } = req.body;
  if (!name || !nation || !validTypes.includes(type) || battle_rating === undefined || rank === undefined) {
    return res.status(400).json({ error: "Please provide all required vehicle fields." });
  }
  const br = Number(battle_rating), vehicleRank = Number(rank);
  if (!Number.isFinite(br) || br < 1 || br > 15 || !Number.isInteger(vehicleRank) || vehicleRank < 1 || vehicleRank > 8) {
    return res.status(400).json({ error: "Battle rating must be 1–15 and rank must be 1–8." });
  }
  const result = db.prepare(
    "UPDATE vehicles SET name=?, nation=?, type=?, battle_rating=?, rank=?, role=?, notes=? WHERE id=?"
  ).run(name.trim(), nation.trim(), type, br, vehicleRank, role || "", notes || "", id);
  if (!result.changes) return res.status(404).json({ error: "Vehicle not found." });
  res.json(db.prepare("SELECT * FROM vehicles WHERE id = ?").get(id));
});

app.delete("/api/vehicles/:id", (req, res) => {
  const result = db.prepare("DELETE FROM vehicles WHERE id = ?").run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "Vehicle not found." });
  res.json({ message: "Vehicle deleted." });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`War Thunder Dashboard running at http://localhost:${PORT}`));
