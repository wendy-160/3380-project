import db from '../db.js';
import { URL } from 'url';

export async function handlePatientRoutes(req, res) {
  console.log('[DEBUG] Entered handlePatientRoutes');

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/api/patients') {
    try {
      const [rows] = await db.query(`
        SELECT PatientID, CONCAT(FirstName, ' ', LastName) AS FullName FROM patient
      `);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching patients:', err.message);
      return sendJson(res, 500, {
        message: 'Error fetching patients',
        error: err.message
      });
    }
  }

  return sendJson(res, 404, { message: 'Route not found' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
