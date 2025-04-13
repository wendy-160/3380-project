import db from '../db.js';
import { URL } from 'url';

export async function handlePatientRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

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
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Primary physician not assigned' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows[0]));
      return;
    } catch (err) {
      console.error('Error fetching primary physician:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error fetching primary physician' }));
      return;
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
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Patient not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows[0]));
      return;
    } catch (err) {
      console.error('Error fetching patient by ID:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error fetching patient data' }));
      return;
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

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows));
      return;
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error fetching patients' }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Patient route not found' }));
}