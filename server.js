const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, user_id INTEGER, description TEXT, status TEXT)");
});

const JWT_SECRET = process.env.JWT_SECRET;

// Registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).send("Error checking username.");
    if (user) return res.status(400).send("Username already exists.");

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
      if (err) return res.status(500).send("Error registering user.");
      res.status(200).send("User registered successfully!");
    });
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) return res.status(404).send("User not found.");

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send("Invalid password.");

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).send({ auth: true, token });
  });
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send("No token provided.");

  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send("Failed to authenticate token.");
    req.userId = decoded.id;
    next();
  });
}

// Create to-do
app.post('/api/todos', verifyToken, (req, res) => {
  const { description } = req.body;

  db.run("INSERT INTO todos (user_id, description, status) VALUES (?, ?, 'pending')", [req.userId, description], function(err) {
    if (err) return res.status(500).send("Error creating to-do.");
    res.status(200).send({ id: this.lastID });
  });
});

// Get all to-dos for the logged-in user
app.get('/api/todos', verifyToken, (req, res) => {
  db.all("SELECT * FROM todos WHERE user_id = ?", [req.userId], (err, todos) => {
    if (err) return res.status(500).send("Error fetching to-dos.");
    res.status(200).send(todos);
  });
});

// Update to-do
app.put('/api/todos/:id', verifyToken, (req, res) => {
  const { description, status } = req.body;

  db.run("UPDATE todos SET description = ?, status = ? WHERE id = ? AND user_id = ?", [description, status, req.params.id, req.userId], function(err) {
    if (err) return res.status(500).send("Error updating to-do.");
    if (this.changes === 0) return res.status(404).send("To-do not found.");
    res.status(200).send("To-do updated successfully!");
  });
});

// Delete to-do
app.delete('/api/todos/:id', verifyToken, (req, res) => {
  db.run("DELETE FROM todos WHERE id = ? AND user_id = ?", [req.params.id, req.userId], function(err) {
    if (err) return res.status(500).send("Error deleting to-do.");
    if (this.changes === 0) return res.status(404).send("To-do not found.");
    res.status(200).send("To-do deleted successfully!");
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
