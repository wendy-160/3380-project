import db from '../db.js';
import { URL } from 'url';

export async function handlePrescriptionRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/api/prescriptions') {
    try {
      const [rows] = await db.query(`
        SELECT 
          p.PrescriptionID, p.PatientID, p.DoctorID, p.AppointmentID,
          p.MedicationMame, p.Dosage, p.Frequency,
          p.StartDate, p.EndDate, p.Notes, p.status,
          CONCAT(pt.FirstName, ' ', pt.LastName) AS PatientName
        FROM prescription p
        JOIN patient pt ON p.PatientID = pt.PatientID
      `);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching prescriptions:', err.message);
      return sendJson(res, 500, { message: 'Error fetching prescriptions' });
    }
  }

  if (method === 'POST' && pathname === '/api/prescriptions') {
    const {
      patientID,
      doctorID,
      appointmentID,
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      notes,
      status
    } = req.body;

    try {
      const [result] = await db.query(`
        INSERT INTO prescription (
          PatientID, DoctorID, AppointmentID,
          MedicationMame, Dosage, Frequency,
          StartDate, EndDate, Notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        patientID,
        doctorID,
        appointmentID || null,
        medicationName,
        dosage,
        frequency,
        startDate,
        endDate || null,
        notes,
        status
      ]);

      return sendJson(res, 201, { message: 'Prescription created', PrescriptionID: result.insertId });
    } catch (err) {
      console.error('Error creating prescription:', err.message);
      return sendJson(res, 500, { message: 'Error creating prescription' });
    }
  }

  return sendJson(res, 404, { message: 'Prescription route not found' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
