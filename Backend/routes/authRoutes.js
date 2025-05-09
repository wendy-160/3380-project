import { login, register } from '../controllers/authController.js';
import db from '../db.js';
import { URL } from 'url';
const API = process.env.REACT_APP_API_URL;


export async function handleAuthRoutes(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'POST' && pathname === '/api/auth/register') {
    return register(req, res);
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    return login(req, res);
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
      return sendJson(res, 500, { message: 'Server error' });
    }
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    return sendJson(res, 200, { message: 'Logged out successfully' });
  }

  return sendJson(res, 404, { message: 'Auth route not found' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}