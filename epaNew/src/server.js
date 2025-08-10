// server.js
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { sequelize, User } from './user.js';
import Downtime from './downtime.js';

const app = express();

// allow overriding in prod; default to your public frontend
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://13.43.111.218:8080';
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Tight CORS (works cleanly when Nginx proxies /api)
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Health check (useful for troubleshooting / uptime checks)
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Sync DB
sequelize.sync()
  .then(() => console.log('Database & tables created!'))
  .catch((err) => console.error('Database sync error:', err));

// Registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all downtime entries for a user
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

// Add entry
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

// Update entry
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

// Delete entry
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
  console.log(`Server running on port ${PORT} (frontend origin: ${FRONTEND_ORIGIN})`);
});
