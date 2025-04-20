import db from '../db.js';
import { URL } from 'url';

export async function handlePatientDoctorRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  function sendJson(status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  if (method === 'PUT' && pathname === '/api/patient-doctor/assign') {
    const { PatientID, DoctorID, isPrimary } = req.body;

try {
  await db.query(
    `DELETE FROM patient_doctor_assignment WHERE PatientID = ?`,
    [PatientID]
  );

  await db.query(
    `INSERT INTO patient_doctor_assignment (PatientID, DoctorID, AssignmentDate, PrimaryPhysicianFlag) VALUES (?, ?, CURDATE(), ?)`,
    [PatientID, DoctorID, isPrimary ? 1 : 0]
  );

  sendJson(200, { message: 'Patient reassigned successfully' });
} catch (err) {
  console.error('Error reassigning patient:', err);
  sendJson(500, { error: err.message });
}

      try {
        await db.query(
          `DELETE FROM patient_doctor_assignment WHERE PatientID = ?`,
          [PatientID]
        );

        await db.query(
          `INSERT INTO patient_doctor_assignment (PatientID, DoctorID, AssignmentDate, PrimaryPhysicianFlag) VALUES (?, ?, CURDATE(), ?)`,
          [PatientID, DoctorID, isPrimary ? 1 : 0]
        );

        sendJson(200, { message: 'Patient reassigned successfully' });
      } catch (err) {
        console.error('Error reassigning patient:', err);
        sendJson(500, { error: err.message });
      }
    });
    return;
  }

  sendJson(404, { message: 'Route not found' });
}