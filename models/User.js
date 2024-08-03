const db = require('../config/db');
const bcrypt = require('bcryptjs');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);
});

const createUser = (username, password, callback) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
    callback(err, this.lastID);
  });
};

const findUserByUsername = (username, callback) => {
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    callback(err, row);
  });
};

module.exports = {
  createUser,
  findUserByUsername
};
