const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./players.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS players (
    username TEXT PRIMARY KEY,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0
  )`);
});

app.get('/player/:username', (req, res) => {
  const { username } = req.params;
  db.get("SELECT * FROM players WHERE username = ?", [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) {
      db.run("INSERT INTO players (username) VALUES (?)", [username], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ username, wins: 0, losses: 0 });
      });
    } else {
      res.json(row);
    }
  });
});

app.post('/player/result', (req, res) => {
  const { username, result } = req.body;
  const column = result === 'win' ? 'wins' : 'losses';
  db.run(`UPDATE players SET ${column} = ${column} + 1 WHERE username = ?`, [username], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/players', (req, res) => {
  db.all("SELECT * FROM players", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/player', (req, res) => {
  const { username } = req.body;
  db.run("INSERT INTO players (username) VALUES (?)", [username], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ username, wins: 0, losses: 0 });
  });
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));