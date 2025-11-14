import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production'; // Change this in production!

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const DATA_DIR = join(process.cwd(), 'server', 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');
const STATS_FILE = join(DATA_DIR, 'stats.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions
function readUsers(): any[] {
  if (!existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeUsers(users: any[]): void {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readStats(): Record<string, { memory: number; tictactoe: number; sudoku: number }> {
  if (!existsSync(STATS_FILE)) return {};
  try {
    return JSON.parse(readFileSync(STATS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeStats(stats: Record<string, any>): void {
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

// Auth middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const users = readUsers();
  
  if (users.find((u: any) => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    username,
    password: hashedPassword,
    id: Date.now().toString()
  };

  users.push(newUser);
  writeUsers(users);

  const token = jwt.sign({ username, id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    user: { username, id: newUser.id },
    token
  });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const users = readUsers();
  const user = users.find((u: any) => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username, id: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    user: { username, id: user.id },
    token
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

// GET /api/games/stats
app.get('/api/games/stats', authenticateToken, (req: any, res) => {
  const stats = readStats();
  const userStats = stats[req.user.username] || { memory: 0, tictactoe: 0, sudoku: 0 };
  res.json(userStats);
});

// POST /api/games/stats/increment
app.post('/api/games/stats/increment', authenticateToken, (req: any, res) => {
  const { gameName } = req.body;
  
  if (!['memory', 'tictactoe', 'sudoku'].includes(gameName)) {
    return res.status(400).json({ error: 'Invalid game name' });
  }

  const stats = readStats();
  if (!stats[req.user.username]) {
    stats[req.user.username] = { memory: 0, tictactoe: 0, sudoku: 0 };
  }

  stats[req.user.username][gameName as keyof typeof stats[string]] += 1;
  writeStats(stats);

  res.json(stats[req.user.username]);
});

// POST /api/games/stats/reset
app.post('/api/games/stats/reset', authenticateToken, (req: any, res) => {
  const stats = readStats();
  stats[req.user.username] = { memory: 0, tictactoe: 0, sudoku: 0 };
  writeStats(stats);

  res.json({ message: 'Stats reset successfully' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});

