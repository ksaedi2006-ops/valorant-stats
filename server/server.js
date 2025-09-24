const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../client'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../client' });
});

const db = new Database("valorant.sqlite", { readonly: true });
console.log("Database connected successfully");



app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/api/matches", (req, res) => {
  try {
    const stmt = db.prepare(
      "SELECT id, match_date, player, kills, deaths, assists FROM matches ORDER BY match_date DESC LIMIT 20"
    );
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const statsStmt = db.prepare(`
  SELECT 
    UPPER(SUBSTR(TRIM(Agent), 1, 1)) || LOWER(SUBSTR(TRIM(Agent), 2)) as Agent,
    ROUND(AVG(CAST(Kills AS FLOAT) / NULLIF(Deaths, 0)), 2) as average_kd,
    ROUND(AVG(Assists), 2) as average_assists,
    ROUND(AVG(HS_Percent), 2) as average_hs,
    ROUND(AVG(Econ), 2) as average_econ
  FROM Game_Scoreboard 
  WHERE Agent IS NOT NULL AND LENGTH(TRIM(Agent)) > 0
  GROUP BY TRIM(Agent)
`);

app.get("/api/agent-stats", (req, res) => {
  try {
    const rows = statsStmt.all();
    res.json(rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});