import db from '../db.js';
import { URL } from 'url';
const API = process.env.REACT_APP_API_URL;


export async function handlePrescriptionRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const sendJson = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (method === 'GET' && pathname === '/api/appointments') {
    const doctorId = parsedUrl.searchParams.get('doctorId');
    if (!doctorId) return sendJson(res, 400, { message: 'Missing doctorId' });

    try {
      const [rows] = await db.query(
        `SELECT AppointmentID, PatientID, DateTime FROM appointment WHERE DoctorID = ?`,
        [doctorId]
      );
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching appointments:', err.message);
      return sendJson(res, 500, { message: 'Error fetching appointments' });
    }
  }

  const matchActive = pathname.match(/^\/api\/prescriptions\/patient\/(\d+)\/active$/);
  if (method === 'GET' && matchActive) {
    const patientID = matchActive[1];
    try {
      const [rows] = await db.query(
        `SELECT * FROM prescription WHERE PatientID = ? AND status = 'Active'`,
        [patientID]
      );
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching prescriptions:', err.message);
      return sendJson(res, 500, { message: 'Error fetching prescriptions' });
    }
  }

  if (method === 'POST' && pathname === '/api/prescriptions') {
    try {
      let body = req.body;

      if (!body) {
        let rawData = '';
        req.on('data', chunk => rawData += chunk);
        req.on('end', async () => {
          try {
            body = JSON.parse(rawData);
            return await insertPrescription(body, res);
          } catch (err) {
            console.error('Invalid JSON body:', err);
            return sendJson(res, 400, { message: 'Invalid JSON' });
          }
        });
        return;
      }

      return await insertPrescription(body, res);

    } catch (err) {
      console.error('Failed processing POST /api/prescriptions:', err.message);
      return sendJson(res, 500, { message: 'Server error' });
    }
  }

  return sendJson(res, 404, { message: 'Prescription route not found' });
}

async function insertPrescription(body, res) {
  const sendJson = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

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
  } = body;

  if (!patientID || !doctorID || !medicationName || !dosage || !frequency || !startDate || !status) {
    return sendJson(res, 400, { message: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO prescription (
        PatientID, DoctorID, AppointmentID,
        MedicationName, Dosage, Frequency,
        StartDate, EndDate, Notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientID,
        doctorID,
        appointmentID || null,
        medicationName,
        dosage,
        frequency,
        startDate,
        endDate || null,
        notes || null,
        status
      ]
    );

    return sendJson(res, 201, { message: 'Prescription created', PrescriptionID: result.insertId });

  } catch (err) {
    console.error('Error inserting prescription:', err.message);
    return sendJson(res, 500, { message: 'Error inserting prescription' });
  }
}