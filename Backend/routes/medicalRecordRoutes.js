import db from '../db.js';
import { URL } from 'url';

export async function handleMedicalRecordRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const sendJson = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const matchByPatient = pathname.match(/^\/api\/medical-records\/patient\/(\d+)$/);
  if (method === 'GET' && matchByPatient) {
    const patientId = matchByPatient[1];
    try {
      const [rows] = await db.query(
        `SELECT mr.*, p.FirstName, p.LastName, p.DOB, p.PhoneNumber
         FROM medicalrecord mr
         JOIN patient p ON mr.PatientID = p.PatientID
         WHERE mr.PatientID = ?
         ORDER BY mr.VisitDate DESC`,
        [patientId]
      );
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching medical records:', err.message);
      return sendJson(res, 500, { message: 'Error fetching records' });
    }
  }

  if (method === 'POST' && pathname === '/api/medical-records') {
    try {
      let body = req.body;

      if (!body) {
        let rawData = '';
        req.on('data', chunk => rawData += chunk);
        req.on('end', async () => {
          try {
            body = JSON.parse(rawData);
            return await insertMedicalRecord(body, res);
          } catch (err) {
            console.error('Invalid JSON body:', err);
            return sendJson(res, 400, { message: 'Invalid JSON' });
          }
        });
        return;
      }

      return await insertMedicalRecord(body, res);
    } catch (err) {
      console.error('Failed processing POST /api/medical-records:', err.message);
      return sendJson(res, 500, { message: 'Server error' });
    }
  }

  return sendJson(res, 404, { message: 'Medical record route not found' });
}

async function insertMedicalRecord(body, res) {
  const sendJson = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const {
    patientId,
    doctorId,
    appointmentId,
    visitDate,
    diagnosis,
    treatmentPlan,
    notes
  } = body;

  if (!patientId || !doctorId || !visitDate || !diagnosis || !treatmentPlan) {
    return sendJson(res, 400, { message: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO medicalrecord (
        PatientID, DoctorID, AppointmentID, VisitDate, Diagnosis, TreatmentPlan, Notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [patientId, doctorId, appointmentId || null, visitDate, diagnosis, treatmentPlan, notes || null]
    );

    return sendJson(res, 201, { message: 'Medical record created', RecordID: result.insertId });

  } catch (err) {
    console.error('Error inserting medical record:', err.message);
    return sendJson(res, 500, { message: 'Error inserting medical record' });
  }
}
