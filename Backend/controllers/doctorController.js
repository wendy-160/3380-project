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

export async function getPrimaryPhysician(req, res, patientId) {
  try {
    console.log(`Fetching primary physician for patient ID: ${patientId}`);
    
    const [rows] = await db.execute(`
      SELECT d.DoctorID, d.FirstName, d.LastName, d.Specialization, d.PhoneNumber
      FROM doctor d
      JOIN patient_doctor_assignment pda ON d.DoctorID = pda.DoctorID
      WHERE pda.PatientID = ? AND pda.PrimaryPhysicianFlag = 1
      LIMIT 1
    `, [patientId]);
    
    console.log('Query result:', rows);

    if (rows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Primary physician not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows[0]));
  } catch (error) {
    console.error('Error fetching primary physician:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal server error', error: error.message }));
  }
}
