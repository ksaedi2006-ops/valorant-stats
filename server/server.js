// Import required packages
const express = require("express");  // Web server framework
const cors = require("cors");        // Allows web browsers to make requests to our server
const Database = require("better-sqlite3");  // SQLite database handler

// Create and configure the web server
const app = express();
app.use(cors());  // Enable CORS for all routes - needed for local development
app.use(express.json());  // Parse JSON request bodies
app.use(express.static('../client')); // Serve static files from client directory

// Root route to serve the main page
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../client' });
});

// Connect to SQLite database
// readonly: true means we can't accidentally modify the database
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

// Prepare the SQL query once at startup for better performance
// This query calculates average stats for each agent
const statsStmt = db.prepare(`
  SELECT 
    -- Format agent names with capital first letter (e.g., "jett" -> "Jett")
    UPPER(SUBSTR(Agent, 1, 1)) || LOWER(SUBSTR(Agent, 2)) as Agent,
    
    -- Calculate K/D ratio with protection against division by zero
    ROUND(AVG(CAST(Kills AS FLOAT) / CASE WHEN Deaths = 0 THEN 1 ELSE Deaths END), 2) as average_kd,
    
    -- Calculate other average stats
    ROUND(AVG(Assists), 2) as average_assists,      -- Average assists per game
    ROUND(AVG(HS_Percent), 2) as average_hs,        -- Average headshot percentage
    ROUND(AVG(Econ), 2) as average_econ            -- Average economy rating
  FROM Game_Scoreboard 
  WHERE Agent IS NOT NULL AND TRIM(Agent) != ''    -- Skip empty or invalid agent names
  GROUP BY Agent                                   -- Get one row per agent
`);

// API endpoint that returns agent statistics
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