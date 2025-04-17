import db from '../db.js';
import { URL } from 'url';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export async function handlePatientRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`Incoming request: ${method} ${pathname}`);
  console.log('Routing to patientRoutes');

  if (method === 'GET' && pathname === '/api/patients') {
    try {
      const [rows] = await db.query('SELECT * FROM patient');
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching all patients:', err);
      return sendJson(res, 500, { message: 'Error fetching patients' });
    }
  }

  const matchPrimaryDoctor = pathname.match(/^\/api\/patients\/(\d+)\/primary-physician$/);
  if (method === 'GET' && matchPrimaryDoctor) {
    const patientId = matchPrimaryDoctor[1];
    try {
      const [rows] = await db.execute(`
        SELECT d.DoctorID, d.FirstName, d.LastName, d.Specialization, d.PhoneNumber
        FROM patient_doctor_assignment pda
        JOIN doctor d ON pda.DoctorID = d.DoctorID
        WHERE pda.PatientID = ? AND pda.PrimaryPhysicianFlag = 1
      `, [patientId]);

      if (rows.length === 0) {
        return sendJson(res, 404, { message: 'Primary physician not assigned' });
      }

      return sendJson(res, 200, rows[0]);
    } catch (err) {
      console.error('Error fetching primary physician:', err);
      return sendJson(res, 500, { message: 'Error fetching primary physician' });
    }
  }

  const matchById = pathname.match(/^\/api\/patients\/(\d+)$/);
  if (method === 'GET' && matchById) {
    const patientId = matchById[1];
    try {
      const [rows] = await db.execute(`
        SELECT p.*, l.email
        FROM patient p
        JOIN login l ON p.UserID = l.UserID
        WHERE p.PatientID = ?
      `, [patientId]);

      if (rows.length === 0) {
        return sendJson(res, 404, { message: 'Patient not found' });
      }

      return sendJson(res, 200, rows[0]);
    } catch (err) {
      console.error('Error fetching patient by ID:', err);
      return sendJson(res, 500, { message: 'Error fetching patient data' });
    }
  }

  const matchByDoctor = pathname.match(/^\/api\/patients\/doctor\/(\d+)$/);
  if (method === 'GET' && matchByDoctor) {
    const doctorId = matchByDoctor[1];
    try {
      const [rows] = await db.execute(`
        SELECT DISTINCT p.PatientID, p.FirstName, p.LastName
        FROM patient p
        JOIN appointment a ON p.PatientID = a.PatientID
        WHERE a.DoctorID = ?
      `, [doctorId]);

      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
      return sendJson(res, 500, { message: 'Error fetching patients' });
    }
  }

  if (method === 'PUT' && matchById) {
    const patientId = matchById[1];
    let body = req.body;

    if (!body) {
      let rawData = '';
      req.on('data', chunk => rawData += chunk);
      req.on('end', async () => {
        try {
          body = JSON.parse(rawData);
          console.log(`Parsed body for PUT /api/patients/${patientId}:`, body);
          await handleUpdatePatient(patientId, body, res);
        } catch (err) {
          console.error('Failed to parse JSON:', err.message);
          return sendJson(res, 400, { message: 'Invalid JSON format' });
        }
      });
    } else {
      console.log(`Parsed body for PUT /api/patients/${patientId}:`, body);
      await handleUpdatePatient(patientId, body, res);
    }

    return;
  }

  return sendJson(res, 404, { message: 'Patient route not found' });
}

async function handleUpdatePatient(patientId, data, res) {
  const { email, address } = data;
  console.log("Update request:", { email, address });

  try {
    const [userResult] = await db.query(
      'SELECT UserID FROM patient WHERE PatientID = ?',
      [patientId]
    );

    if (userResult.length === 0) {
      return sendJson(res, 404, { message: 'Patient not found' });
    }

    const userId = userResult[0].UserID;

    if (address !== undefined && address !== '') {
      console.log('Updating address...');
      await db.query(
        'UPDATE patient SET Address = ? WHERE PatientID = ?',
        [address, patientId]
      );
    }

    if (email !== undefined && email !== '') {
      console.log('Updating email...');
      await db.query(
        'UPDATE login SET email = ? WHERE UserID = ?',
        [email, userId]
      );
    }

    const [updated] = await db.query(`
      SELECT p.*, l.email
      FROM patient p
      JOIN login l ON p.UserID = l.UserID
      WHERE p.PatientID = ?
    `, [patientId]);

    console.log("Updated patient data:", updated[0]);
    return sendJson(res, 200, updated[0]);

  } catch (err) {
    console.error('Error updating patient profile:', err);
    return sendJson(res, 500, { message: 'Failed to update profile' });
  }
}