// 1. IMPORTS
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-key-that-should-be-long-and-random';

// 2. APP SETUP
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 3. DATABASE CONNECTION
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the tasks database.');
  db.run('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, completed BOOLEAN, user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id))');
});

// 4. AUTHENTICATION MIDDLEWARE
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// 5. API ROUTES

// --- AUTH ROUTES ---
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(sql, [username, hashedPassword], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Username already exists' });
      }
      res.status(201).json({ id: this.lastID, username: username });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  });
});

// --- TASK ROUTES (PROTECTED & AUTHORIZED) ---

// GET: Fetch tasks for the logged-in user
app.get('/tasks', auth, (req, res) => {
  const sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY id";
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST: Create a new task for the logged-in user
app.post('/tasks', auth, (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  const sql = 'INSERT INTO tasks (description, completed, user_id) VALUES (?, ?, ?)';
  const params = [description, false, req.user.id];
  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      description: description,
      completed: false,
      user_id: req.user.id
    });
  });
});

// PUT: Update a task belonging to the logged-in user
app.put('/tasks/:id', auth, (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed status is required' });
  }
  const sql = 'UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?';
  const params = [completed, id, req.user.id];
  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found or user not authorized' });
    }
    res.status(200).json({ message: 'Task updated successfully' });
  });
});

// DELETE: Delete a task belonging to the logged-in user
app.delete('/tasks/:id', auth, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
  db.run(sql, [id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found or user not authorized' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});

// 6. START THE SERVER
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});