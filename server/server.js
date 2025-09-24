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
    UPPER(SUBSTR(Agent, 1, 1)) || LOWER(SUBSTR(Agent, 2)) as Agent,
    ROUND(AVG(CAST(Kills AS FLOAT) / CASE WHEN Deaths = 0 THEN 1 ELSE Deaths END), 2) as average_kd,
    ROUND(AVG(Assists), 2) as average_assists,
    ROUND(AVG(HS_Percent), 2) as average_hs,
    ROUND(AVG(Econ), 2) as average_econ
  FROM Game_Scoreboard 
  WHERE Agent IS NOT NULL AND TRIM(Agent) != ''
  GROUP BY Agent
`);

app.get("/api/agent-stats", (req, res) => {
  try {
    // Execute the prepared statement and get all results
    const rows = statsStmt.all();
    res.json(rows);  // Send the results as JSON
  } catch (err) {
    // If anything goes wrong, log it and send a generic error to the client
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Server is now managed by Render