import db from '../db.js';
import { URL } from 'url';

export async function handleAppointmentRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const matchDateRoute = pathname.match(/^\/api\/appointments\/doctor\/(\d+)\/date\/([\d-]+)$/);
  if (method === 'GET' && matchDateRoute) {
    const doctorID = matchDateRoute[1];
    const date = matchDateRoute[2];
    try {
      const query = `
        SELECT a.AppointmentID, a.DateTime, a.Reason,
               p.FirstName AS PatientName, p.LastName AS PatientLastName
        FROM appointment a
        JOIN patient p ON a.PatientID = p.PatientID
        WHERE a.DoctorID = ? AND DATE(a.DateTime) = ?
        ORDER BY a.DateTime ASC;
      `;
      const [appointments] = await db.execute(query, [doctorID, date]);
      return sendJson(res, 200, appointments);
    } catch (err) {
      console.error('Error fetching doctor daily appointments:', err.message);
      return sendJson(res, 500, { message: 'Error fetching appointments by date' });
    }
  }

  if (method === 'GET' && pathname === '/api/appointments' && parsedUrl.searchParams.has('doctorId')) {
    const doctorID = parsedUrl.searchParams.get('doctorId');
    try {
      const query = `
        SELECT a.AppointmentID, a.PatientID, a.DoctorID, a.DateTime AS AppointmentDate, a.Reason, a.Status,
               p.FirstName, p.LastName
        FROM appointment a
        JOIN patient p ON a.PatientID = p.PatientID
        WHERE a.DoctorID = ?
        ORDER BY a.DateTime DESC;
      `;
      const [appointments] = await db.execute(query, [doctorID]);
      return sendJson(res, 200, appointments);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err.message);
      return sendJson(res, 500, { message: 'Error fetching appointments' });
    }
  }

  const patientIDMatch = pathname.match(/^\/api\/appointments\/(\d+)$/);
  if (method === 'GET' && patientIDMatch) {
    const patientID = patientIDMatch[1];
    try {
      const query = `
        SELECT a.AppointmentID, a.DateTime, a.Reason, a.Status,
               p.FirstName AS PatientName, d.FirstName AS DoctorName
        FROM appointment a
        JOIN patient p ON a.PatientID = p.PatientID
        JOIN doctor d ON a.DoctorID = d.DoctorId
        WHERE a.PatientID = ?
        ORDER BY a.DateTime DESC;
      `;
      const [appointments] = await db.execute(query, [patientID]);
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
        INSERT INTO appointment (PatientID, DoctorID, DateTime, Reason, Status)
        VALUES (?, ?, ?, ?, ?);
      `;
      const [result] = await db.execute(query, [patientID, doctorID, dateTime, reason, status]);
      return sendJson(res, 201, {
        AppointmentID: result.insertId,
        PatientID: patientID,
        DoctorID: doctorID,
        DateTime: dateTime,
        Reason: reason,
        Status: status
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
        UPDATE appointment
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
        DELETE FROM appointment
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

  sendJson(res, 404, { message: 'Appointment route not found.' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
