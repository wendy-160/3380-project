import db from '../db.js';
import { URL } from 'url';

export async function handlePrescriptionRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const matchActive = pathname.match(/^\/api\/prescriptions\/patient\/(\d+)\/active$/);
  if (method === 'GET' && matchActive) {
    const patientID = matchActive[1];
    try {
      const [rows] = await db.query(`
        SELECT * FROM prescription
        WHERE PatientID = ? AND status = 'Active'
      `, [patientID]);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching active prescriptions:', err.message);
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
          MedicationName, Dosage, Frequency,
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
      return sendJson(res, 201, { PrescriptionID: result.insertId });
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