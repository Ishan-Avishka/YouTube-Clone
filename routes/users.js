const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const usersPath = path.join(__dirname, '../data/users.json');

const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  } catch {
    return [];
  }
};

const writeUsers = (data) => {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
};

// GET all users
router.get('/', (req, res) => {
  const users = readUsers();
  res.json(users.map(u => ({ id: u.id, username: u.username, avatar: u.avatar })));
});

// POST register / login (simple, no password hashing for portfolio)
router.post('/auth', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Username required' });

  const users = readUsers();
  let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    user = {
      id: uuidv4(),
      username,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    writeUsers(users);
  }

  res.json(user);
});

module.exports = router;
