import db from '../db.js';

export async function handleGetMedicalRecordsByPatientId(req, res, patientId) {
  try {
    const [results] = await db.query(
      `
      SELECT mr.*, 
             p.PatientID, p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
             d.DoctorID, d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
      FROM medicalrecord mr
      JOIN patient p ON mr.PatientID = p.PatientID
      JOIN doctor d ON mr.DoctorID = d.DoctorID
      WHERE mr.PatientID = ?
      `,
      [patientId]
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Failed to fetch records' }));
  }
}

export async function handleCreateMedicalRecord(req, res, body) {
  try {
    const { patientId, appointmentId, doctorId, visitDate, diagnosis, treatmentPlan, notes } = body;

    await db.query(
      `
      INSERT INTO medicalrecord 
      (PatientID, AppointmentID, DoctorID, VisitDate, Diagnosis, TreatmentPlan, Notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [patientId, appointmentId, doctorId, visitDate, diagnosis, treatmentPlan, notes]
    );

    res.writeHead(201);
    res.end(JSON.stringify({ message: 'Medical record created' }));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Failed to create medical record' }));
  }
}

export async function handleSearchMedicalRecords(req, res, query) {
  try {
    const { name, date } = query;
    let sql = `
      SELECT mr.*, 
             p.PatientID, p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
             d.DoctorID, d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
      FROM medicalrecord mr
      JOIN patient p ON mr.PatientID = p.PatientID
      JOIN doctor d ON mr.DoctorID = d.DoctorID
      WHERE 1=1
    `;

    const params = [];

    if (name) {
      sql += ` AND (p.FirstName LIKE ? OR p.LastName LIKE ?)`;
      params.push(`%${name}%`, `%${name}%`);
    }

    if (date) {
      sql += ` AND mr.VisitDate = ?`;
      params.push(date);
    }

    const [results] = await db.query(sql, params);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Search failed' }));
  }
}