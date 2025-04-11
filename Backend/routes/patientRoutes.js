import db from '../db.js';
import { URL } from 'url';

export async function handlePatientRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const matchDoctorPatients = pathname.match(/^\/api\/patients\/doctor\/(\d+)$/);
  if (method === 'GET' && matchDoctorPatients) {
    const doctorId = matchDoctorPatients[1];
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
      console.error('❌ Error fetching patients for doctor:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Error fetching patients' }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Patient route not found' }));
}
