import db from '../db.js';
import { URL } from 'url';

export async function handlePatientRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (method === 'GET' && pathname === '/api/patients') {
    try {
      const [rows] = await db.query('SELECT * FROM patient');
      return sendJson(200, rows);
    } catch (err) {
      console.error('Error fetching all patients:', err);
      return sendJson(500, { message: 'Error fetching patients' });
    }
  }

  const matchPrimaryDoctor = pathname.match(/^\/api\/patients\/(\d+)\/primary-physician$/);
  if (method === 'GET' && matchPrimaryDoctor) {
    const patientId = matchPrimaryDoctor[1];
    try {
      const [rows] = await db.execute(`
        SELECT d.DoctorID, d.FirstName, d.LastName, d.Specialization, d.PhoneNumber
        FROM patient p
        JOIN doctor d ON p.PrimaryDoctorID = d.DoctorID
        WHERE p.PatientID = ?
      `, [patientId]);

      if (rows.length === 0) {
        return sendJson(404, { message: 'Primary physician not assigned' });
      }

      return sendJson(200, rows[0]);
    } catch (err) {
      console.error('Error fetching primary physician:', err);
      return sendJson(500, { message: 'Error fetching primary physician' });
    }
  }

  const matchById = pathname.match(/^\/api\/patients\/(\d+)$/);
  if (method === 'GET' && matchById) {
    const patientId = matchById[1];
    try {
      const [rows] = await db.execute(`
        SELECT p.*, l.email
        FROM patient p
        JOIN login l ON p.UserID = l.UserID
        WHERE p.PatientID = ?
      `, [patientId]);

      if (rows.length === 0) {
        return sendJson(404, { message: 'Patient not found' });
      }

      return sendJson(200, rows[0]);
    } catch (err) {
      console.error('Error fetching patient by ID:', err);
      return sendJson(500, { message: 'Error fetching patient data' });
    }
  }

  const matchByDoctor = pathname.match(/^\/api\/patients\/doctor\/(\d+)$/);
  if (method === 'GET' && matchByDoctor) {
    const doctorId = matchByDoctor[1];
    try {
      const [rows] = await db.execute(`
        SELECT DISTINCT p.PatientID, p.FirstName, p.LastName
        FROM patient p
        JOIN appointment a ON p.PatientID = a.PatientID
        WHERE a.DoctorID = ?
      `, [doctorId]);

      return sendJson(200, rows);
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
      return sendJson(500, { message: 'Error fetching patients' });
    }
  }

  return sendJson(404, { message: 'Patient route not found' });
}
