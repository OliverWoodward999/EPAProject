// server.js
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { sequelize, User } from './user.js';
import Downtime from './downtime.js';

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cors());

// Sync the database and create tables if they don't exist
sequelize.sync()
  .then(() => console.log('Database & tables created!'))
  .catch((err) => console.error('Database sync error:', err));

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Compare the hashed password with the provided password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all downtime entries for a user (username passed as query param)
app.get('/api/downtime', async (req, res) => {
  const { username } = req.query;
  try {
    const entries = await Downtime.findAll({ where: { username } });
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching downtime entries' });
  }
});

// Add a new downtime entry
app.post('/api/downtime', async (req, res) => {
  const { username, clockIn, clockOut, notes } = req.body;
  try {
    const entry = await Downtime.create({ username, clockIn, clockOut, notes });
    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating downtime entry' });
  }
});

// Edit an existing downtime entry
app.put('/api/downtime/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await Downtime.findByPk(id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.update(req.body);
    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating downtime entry' });
  }
});

// Delete a downtime entry
app.delete('/api/downtime/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await Downtime.findByPk(id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    await entry.destroy();
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting downtime entry' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});