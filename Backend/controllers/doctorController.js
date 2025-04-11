import db from '../db.js';

export async function getSpecialists(req, res) {
  try {
    const [rows] = await db.query(`SELECT * FROM doctor WHERE Specialization != 'General'`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function getAssignedPatients(req, res, doctorId) {
  try {
    const [rows] = await db.query(`
      SELECT p.PatientID, p.FirstName, p.LastName
      FROM patient p
      JOIN appointment a ON p.PatientID = a.PatientID
      WHERE a.DoctorID = ?
      GROUP BY p.PatientID
    `, [doctorId]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}
