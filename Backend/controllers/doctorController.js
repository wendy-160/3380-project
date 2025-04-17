import db from '../db.js';

export async function getAllDoctors(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT DoctorID, FirstName, LastName
      FROM doctor
    `);

    console.log('Sending doctor list:', rows);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (err) {
    console.error('Error fetching all doctors:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function getSpecialists(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT DoctorID, FirstName, LastName
      FROM doctor
      WHERE Specialization != 'Primary Care Physician'
    `);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (err) {
    console.error('Error fetching specialists:', err);
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
    console.error('Error fetching assigned patients:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function getPrimaryPhysician(req, res, patientId) {
  try {
    const [rows] = await db.query(`
      SELECT d.DoctorID, d.FirstName, d.LastName, d.Specialization, d.PhoneNumber
      FROM doctor d
      JOIN patient_doctor_assignment pda ON d.DoctorID = pda.DoctorID
      WHERE pda.PatientID = ? AND pda.PrimaryPhysicianFlag = 1
      LIMIT 1
    `, [patientId]);

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
export async function getDoctorOffices(req, res, doctorId) {
  try {
    const [rows] = await db.query(`
      SELECT o.OfficeID, o.OfficeName, o.Address, o.City, o.State, o.ZipCode,
             dof.WorkDays, dof.WorkHours
      FROM doctor_office dof
      JOIN office o ON dof.OfficeID = o.OfficeID
      WHERE dof.DoctorID = ?
    `, [doctorId]);

    if (rows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'No offices found for this doctor' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (error) {
    console.error('Error fetching doctor offices:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal server error', error: error.message }));
  }
}
export async function getDoctorById(req, res, doctorId) {
  try {
    const [rows] = await db.query(
      'SELECT DoctorID, UserID, FirstName, LastName, Specialization, PhoneNumber FROM doctor WHERE DoctorID = ?',
      [doctorId]
    );

    if (rows.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Doctor not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows[0]));
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal server error' }));
  }
}