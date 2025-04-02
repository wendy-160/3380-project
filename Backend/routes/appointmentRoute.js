import db from '../db.js';
import { URL } from 'url';

export async function handleAppointmentRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const patientIDMatch = pathname.match(/^\/api\/appointments\/(\d+)$/);
  if (method === 'GET' && patientIDMatch) {
    const patientID = patientIDMatch[1];
    try {
      const query = `
        SELECT a.AppointmentID, a.DateTime, a.Reason, a.Status, 
               p.PatientName, d.DoctorName
        FROM appointments a
        JOIN patients p ON a.PatientID = p.PatientID
        JOIN doctors d ON a.DoctorID = d.DoctorID
        WHERE a.PatientID = ?
        ORDER BY a.DateTime DESC;
      `;
      const [appointments] = await db.execute(query, [patientID]);
      if (appointments.length === 0) {
        return sendJson(res, 404, { message: 'No appointments found.' });
      }
      return sendJson(res, 200, appointments);
    } catch (err) {
      console.error(err);
      return sendJson(res, 500, { message: 'Error fetching appointments.' });
    }
  }

  if (method === 'POST' && pathname === '/api/appointments') {
    const { patientID, doctorID, dateTime, reason, status } = req.body;
    if (!patientID || !doctorID || !dateTime || !reason || !status) {
      return sendJson(res, 400, { message: 'Missing required fields' });
    }

    try {
      const query = `
        INSERT INTO appointments (PatientID, DoctorID, DateTime, Reason, Status)
        VALUES (?, ?, ?, ?, ?);
      `;
      const [result] = await db.execute(query, [patientID, doctorID, dateTime, reason, status]);
      return sendJson(res, 201, {
        AppointmentID: result.insertId,
        PatientID: patientID,
        DoctorID: doctorID,
        DateTime: dateTime,
        Reason: reason,
        Status: status,
      });
    } catch (err) {
      console.error(err);
      return sendJson(res, 500, { message: 'Error adding appointment.' });
    }
  }

  const updateMatch = pathname.match(/^\/api\/appointments\/(\d+)$/);
  if (method === 'PUT' && updateMatch) {
    const appointmentID = updateMatch[1];
    const { patientID, doctorID, dateTime, reason, status } = req.body;
    try {
      const query = `
        UPDATE appointments
        SET DoctorID = ?, DateTime = ?, Reason = ?, Status = ?
        WHERE AppointmentID = ? AND PatientID = ?;
      `;
      const [result] = await db.execute(query, [doctorID, dateTime, reason, status, appointmentID, patientID]);
      if (result.affectedRows === 0) {
        return sendJson(res, 404, { message: 'Appointment not found or unauthorized.' });
      }
      return sendJson(res, 200, { message: 'Appointment updated successfully.' });
    } catch (err) {
      console.error(err);
      return sendJson(res, 500, { message: 'Error updating appointment.' });
    }
  }

  const deleteMatch = pathname.match(/^\/api\/appointments\/(\d+)$/);
  if (method === 'DELETE' && deleteMatch) {
    const appointmentID = deleteMatch[1];
    const { patientID } = req.body;

    try {
      const query = `
        DELETE FROM appointments
        WHERE AppointmentID = ? AND PatientID = ?;
      `;
      const [result] = await db.execute(query, [appointmentID, patientID]);
      if (result.affectedRows === 0) {
        return sendJson(res, 404, { message: 'Appointment not found or unauthorized.' });
      }
      return sendJson(res, 200, { message: 'Appointment deleted successfully.' });
    } catch (err) {
      console.error(err);
      return sendJson(res, 500, { message: 'Error deleting appointment.' });
    }
  }

  sendJson(res, 404, { message: 'Appointment not found.' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
