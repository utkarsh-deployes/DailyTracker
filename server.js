// 1. IMPORTS
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // ** NEW: Import the path module

// 2. APP SETUP
const app = express();
app.use(cors());
app.use(express.json());

// ** NEW: Serve static frontend files (HTML, CSS, JS) **
app.use(express.static(path.join(__dirname)));

// 3. DATABASE CONNECTION
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the tasks database.');
  db.run('CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, completed BOOLEAN)');
});


// 4. API ROUTES (All your endpoints go here, BEFORE listen)

// GET: Fetch all tasks
app.get('/tasks', (req, res) => {
  const sql = "SELECT * FROM tasks ORDER BY id";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST: Create a new task
app.post('/tasks', (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  const sql = 'INSERT INTO tasks (description, completed) VALUES (?, ?)';
  const params = [description, false];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({
      id: this.lastID,
      description: description,
      completed: false
    });
  });
});

// PUT: Update a task (e.g., mark as complete)
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed status (true or false) is required' });
  }

  const sql = 'UPDATE tasks SET completed = ? WHERE id = ?';
  const params = [completed, id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task updated successfully' });
  });
});

// DELETE: Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tasks WHERE id = ?';

  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});


// 5. START THE SERVER (This MUST be the last thing)
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});