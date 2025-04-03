import db from '../db.js';
import { URL } from 'url';

export async function handleTestRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/api/tests') {
    try {
      const [rows] = await db.query('SELECT * FROM medicaltest');
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching tests:', err.message);
      return sendJson(res, 500, { message: 'Error fetching tests' });
    }
  }

  if (method === 'POST' && pathname === '/api/tests') {
    const { test_type, patient_id, doctor_id, office_id } = req.body;

    if (!test_type || !patient_id || !doctor_id || !office_id) {
      return sendJson(res, 400, { message: 'All fields are required' });
    }

    try {
      await db.query(`
        INSERT INTO medicaltest (
          TestName, TestType, PatientID, DoctorID, OfficeID, TestDate
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, ['General Test', test_type, patient_id, doctor_id, office_id]);

      return sendJson(res, 201, { message: 'Medical test ordered' });
    } catch (err) {
      console.error('Error ordering test:', err.message);
      return sendJson(res, 500, { message: 'Error ordering test' });
    }
  }

  return sendJson(res, 404, { message: 'Test route not found' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
