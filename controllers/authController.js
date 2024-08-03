const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const register = (req, res) => {
  const { username, password } = req.body;
  User.createUser(username, password, (err, userId) => {
    if (err) return res.status(500).json({ message: 'Error registering user' });
    res.status(201).json({ message: 'User registered successfully' });
  });
};

const login = (req, res) => {
  const { username, password } = req.body;
  User.findUserByUsername(username, (err, user) => {
    if (err || !user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
};

module.exports = {
  register,
  login
};
