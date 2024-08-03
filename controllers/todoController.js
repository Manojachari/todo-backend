const Todo = require('../models/Todo');

const createTodo = (req, res) => {
  const userId = req.user.id;
  const { description } = req.body;
  Todo.createTodo(userId, description, (err, todoId) => {
    if (err) return res.status(500).json({ message: 'Error creating todo' });
    res.status(201).json({ id: todoId, userId, description, status: 'pending' });
  });
};

const getTodos = (req, res) => {
  const userId = req.user.id;
  Todo.getTodosByUserId(userId, (err, todos) => {
    if (err) return res.status(500).json({ message: 'Error fetching todos' });
    res.json(todos);
  });
};

const updateTodo = (req, res) => {
  const { id } = req.params;
  const { description, status } = req.body;
  Todo.updateTodo(id, description, status, (err) => {
    if (err) return res.status(500).json({ message: 'Error updating todo' });
    res.json({ message: 'Todo updated successfully' });
  });
};

const deleteTodo = (req, res) => {
  const { id } = req.params;
  Todo.deleteTodo(id, (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting todo' });
    res.json({ message: 'Todo deleted successfully' });
  });
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
};
