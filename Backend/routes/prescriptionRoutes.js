import db from '../db.js';
import { URL } from 'url';

export async function handlePrescriptionRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const match = pathname.match(/^\/api\/prescriptions\/patient\/(\d+)$/);
  if (method === 'GET' && match) {
    const patientId = match[1];
    const query = 'SELECT * FROM prescriptions WHERE PatientID = ?';

    db.query(query, [patientId], (err, results) => {
      if (err) {
        console.error('Error fetching prescriptions:', err);
        return sendJson(res, 500, { message: 'Error fetching prescriptions' });
      }
      return sendJson(res, 200, results);
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/prescriptions') {
    const {
      PatientID,
      MedicalRecordID,
      DoctorID,
      Appointment,
      MedicationName,
      Dosage,
      Frequency,
      DatePrescribed,
      Duration
    } = req.body;

    const query = `
      INSERT INTO prescriptions 
        (PatientID, MedicalRecordID, DoctorID, Appointment, MedicationName, Dosage, Frequency, DatePrescribed, Duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
      PatientID,
      MedicalRecordID,
      DoctorID,
      Appointment,
      MedicationName,
      Dosage,
      Frequency,
      DatePrescribed,
      Duration
    ], (err, results) => {
      if (err) {
        console.error('Error adding prescription:', err);
        return sendJson(res, 500, { message: 'Error adding prescription' });
      }
      return sendJson(res, 201, {
        message: 'Prescription added successfully',
        prescriptionId: results.insertId
      });
    });
    return;
  }

  return sendJson(res, 404, { message: 'Prescription route not found' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
