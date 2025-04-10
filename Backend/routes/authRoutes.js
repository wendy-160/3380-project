import bcrypt from 'bcryptjs';
import db from '../db.js';
import { URL } from 'url';

export async function handleAuthRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'POST' && pathname === '/api/auth/register') {
    const { username, email, password, role } = req.body;

    try {
      const [existing] = await db.query('SELECT * FROM login WHERE email = ?', [email]);
      if (existing.length > 0) {
        return sendJson(res, 409, { message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO login (username, email, password, role) VALUES (?, ?, ?, ?)';
      await db.query(sql, [username, email, hashedPassword, role || 'patient']);

      return sendJson(res, 201, { message: ' User registered successfully' });
    } catch (err) {
      console.error('Registration error:', err.message);
      return sendJson(res, 500, { message: 'Registration failed' });
    }
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    const { email, password } = req.body;

    try {
      const [rows] = await db.query('SELECT * FROM login WHERE email = ?', [email]);

      if (rows.length === 0) {
        return sendJson(res, 401, { message: 'Invalid email or password' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return sendJson(res, 401, { message: 'Invalid email or password' });
      }

      return sendJson(res, 200, {
        message: 'Login successful',
        role: user.role,
      });
    } catch (err) {
      console.error('Login error:', err.message);
      return sendJson(res, 500, { message: 'Server error during login' });
    }
  }

  if (method === 'GET' && pathname === '/api/auth/me') {
    const email = req.headers['x-user-email'];

    if (!email) {
      return sendJson(res, 401, { message: 'Unauthorized' });
    }

    try {
      const [rows] = await db.query('SELECT role FROM login WHERE email = ?', [email]);
      if (rows.length === 0) {
        return sendJson(res, 404, { message: 'User not found' });
      }

      return sendJson(res, 200, { role: rows[0].role });
    } catch (err) {
      console.error('Me endpoint error:', err.message);
      return sendJson(res, 500, { message: 'Server error' });
    }
  }

  return sendJson(res, 404, { message: 'Auth route not found' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
