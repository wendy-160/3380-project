import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM login WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: '⚠️ Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO login (username, email, password, role) VALUES (?, ?, ?, ?)';
    await db.query(sql, [username, email, hashedPassword, role || 'patient']);

    res.status(201).json({ message: '✅ User registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM login WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: '✅ Login successful',
      role: user.role,
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', async (req, res) => {
  const token = req.cookies.token; // If you're using cookies
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const [rows] = await db.query("SELECT role FROM login WHERE email = ?", [req.email]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ role: rows[0].role });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;