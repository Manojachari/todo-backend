const db = require('../config/db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    description TEXT,
    status TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

const createTodo = (userId, description, callback) => {
  db.run(`INSERT INTO todos (user_id, description, status) VALUES (?, ?, 'pending')`, [userId, description], function(err) {
    callback(err, this.lastID);
  });
};

const getTodosByUserId = (userId, callback) => {
  db.all(`SELECT * FROM todos WHERE user_id = ?`, [userId], (err, rows) => {
    callback(err, rows);
  });
};

const updateTodo = (id, description, status, callback) => {
  db.run(`UPDATE todos SET description = ?, status = ? WHERE id = ?`, [description, status, id], (err) => {
    callback(err);
  });
};

const deleteTodo = (id, callback) => {
  db.run(`DELETE FROM todos WHERE id = ?`, [id], (err) => {
    callback(err);
  });
};

module.exports = {
  createTodo,
  getTodosByUserId,
  updateTodo,
  deleteTodo
};
