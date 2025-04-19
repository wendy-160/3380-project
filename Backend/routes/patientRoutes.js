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

  // GET all patients
  if (method === 'GET' && pathname === '/api/patients') {
    try {
      const [rows] = await db.query('SELECT * FROM patient');
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching all patients:', err);
      return sendJson(res, 500, { message: 'Error fetching patients' });
    }
  }

  if (method === 'GET' && pathname === '/api/patients/search') {
    const name = parsedUrl.searchParams.get('name')?.trim() || '';
    const dob = parsedUrl.searchParams.get('dob')?.trim() || '';
    const phone = parsedUrl.searchParams.get('phone')?.trim() || '';
  
    let query = `
      SELECT 
        p.PatientID, p.FirstName, p.LastName, p.DOB, p.PhoneNumber,
        mr.AppointmentID, mr.DoctorID, mr.VisitDate, 
        mr.Diagnosis, mr.TreatmentPlan, mr.Notes, 
        mr.created_at, mr.updated_at
      FROM patient p
      LEFT JOIN medicalrecord mr ON p.PatientID = mr.PatientID
      WHERE 1=1
    `;
    const params = [];
  
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length === 1) {
        query += ' AND (p.FirstName LIKE ? OR p.LastName LIKE ?)';
        params.push(`%${nameParts[0]}%`, `%${nameParts[0]}%`);
      } else {
        query += ' AND (p.FirstName LIKE ? AND p.LastName LIKE ?)';
        params.push(`%${nameParts[0]}%`, `%${nameParts[1]}%`);
      }
    }
  
    if (dob) {
      query += ' AND DATE(p.DOB) = ?';
      params.push(dob);
    }
  
    if (phone) {
      query += ' AND p.PhoneNumber LIKE ?';
      params.push(`%${phone}%`);
    }
  
    try {
      const [results] = await db.query(query, params);
      console.log('✅ Final search results:', results);
      return sendJson(res, 200, results);
    } catch (err) {
      console.error('❌ SQL Error during search:', err.message);
      return sendJson(res, 500, { message: 'Failed to search patients' });
    }
  }
  
  
  

  // GET by PatientID
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

  // GET primary physician for patient
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

  // GET patients assigned to a doctor
  const matchByDoctor = pathname.match(/^\/api\/patients\/doctor\/(\d+)$/);
  if (method === 'GET' && matchByDoctor) {
    const doctorId = matchByDoctor[1];
    try {
      const [rows] = await db.execute(`
        SELECT p.PatientID, p.FirstName, p.LastName
        FROM patient p
        JOIN patient_doctor_assignment a ON p.PatientID = a.PatientID
        WHERE a.DoctorID = ? AND a.PrimaryPhysicianFlag = 1
      `, [doctorId]);

      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
      return sendJson(res, 500, { message: 'Error fetching patients' });
    }
  }

  // PUT update patient (email, address)
  if (method === 'PUT' && matchById) {
    const patientId = matchById[1];
    let body = req.body;

    if (!body) {
      let rawData = '';
      req.on('data', chunk => rawData += chunk);
      req.on('end', async () => {
        try {
          body = JSON.parse(rawData);
          await handleUpdatePatient(patientId, body, res);
        } catch (err) {
          console.error('Failed to parse JSON:', err.message);
          return sendJson(res, 400, { message: 'Invalid JSON format' });
        }
      });
    } else {
      await handleUpdatePatient(patientId, body, res);
    }
    return;
  }

  return sendJson(res, 404, { message: 'Patient route not found' });
}

async function handleUpdatePatient(patientId, data, res) {
  const { email, address } = data;

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
      await db.query(
        'UPDATE patient SET Address = ? WHERE PatientID = ?',
        [address, patientId]
      );
    }

    if (email !== undefined && email !== '') {
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

    return sendJson(res, 200, updated[0]);

  } catch (err) {
    console.error('Error updating patient profile:', err);
    return sendJson(res, 500, { message: 'Failed to update profile' });
  }
}