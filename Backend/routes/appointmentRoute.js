import db from '../db.js';
import { URL } from 'url';

export async function handleAppointmentRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/api/appointments') {
    try {
      const [rows] = await db.execute(`
        SELECT a.AppointmentID, a.PatientID, a.DoctorID, a.OfficeID, a.DateTime, a.Reason, a.Status,
               p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
               d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
        FROM appointment a
        JOIN patient p ON a.PatientID = p.PatientID
        JOIN doctor d ON a.DoctorID = d.DoctorID
        ORDER BY a.DateTime DESC
      `);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching all appointments:', err);
      return sendJson(res, 500, { message: 'Error fetching appointments' });
    }
  }

  const matchDoctorDateAppointments = pathname.match(/^\/api\/appointments\/doctor\/(\d+)\/date\/([\d-]+)$/);
  if (method === 'GET' && matchDoctorDateAppointments) {
    const doctorID = matchDoctorDateAppointments[1];
    const date = matchDoctorDateAppointments[2];
    try {
      const [rows] = await db.execute(`
        SELECT a.AppointmentID, a.DateTime, a.Reason, a.Status,
               p.FirstName AS PatientName, p.LastName AS PatientLastName
        FROM appointment a
        JOIN patient p ON a.PatientID = p.PatientID
        WHERE a.DoctorID = ? AND DATE(a.DateTime) = ?
        ORDER BY a.DateTime ASC
      `, [doctorID, date]);

      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching doctor daily appointments:', err);
      return sendJson(res, 500, { message: 'Error fetching doctor appointments' });
    }
  }

  const matchAvailableRoute = pathname.match(/^\/api\/appointments\/available\/(\d+)\/([\d-]+)$/);
  if (method === 'GET' && matchAvailableRoute) {
    const doctorID = matchAvailableRoute[1];
    const date = matchAvailableRoute[2];

    try {
      const startHour = 9;
      const endHour = 17;
      const slotDuration = 30;
      const slots = [];

      for (let hour = startHour; hour < endHour; hour++) {
        for (let min = 0; min < 60; min += slotDuration) {
          const time = `${date}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
          slots.push(time);
        }
      }

      const [booked] = await db.execute(
        `SELECT DateTime FROM appointment WHERE DoctorID = ? AND DATE(DateTime) = ?`,
        [doctorID, date]
      );
      const bookedTimes = new Set(booked.map(row => new Date(row.DateTime).toISOString()));
      const available = slots.filter(slot => !bookedTimes.has(new Date(slot).toISOString()));

      return sendJson(res, 200, available);
    } catch (err) {
      console.error('Error checking available time slots:', err.message);
      return sendJson(res, 500, { message: 'Error checking availability' });
    }
  }

  const matchUpcomingAppointments = pathname.match(/^\/api\/appointments\/patient\/(\d+)\/upcoming$/);
  if (method === 'GET' && matchUpcomingAppointments) {
    const patientID = matchUpcomingAppointments[1];
    try {
      const [rows] = await db.execute(`
        SELECT a.*, o.OfficeName
        FROM appointment a
        JOIN office o ON a.OfficeID = o.OfficeID
        WHERE a.PatientID = ? AND a.DateTime >= NOW()
        ORDER BY a.DateTime ASC
      `, [patientID]);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error("Error fetching upcoming appointments:", err);
      return sendJson(res, 500, { message: "Error fetching upcoming appointments" });
    }
  }

  if (method === 'POST' && pathname === '/api/appointments') {
    try {
      const { PatientID, DoctorID, OfficeID, DateTime, Reason, status } = req.body;

      const [result] = await db.execute(`
        INSERT INTO appointment (PatientID, DoctorID, OfficeID, DateTime, Reason, Status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [PatientID, DoctorID, OfficeID, DateTime, Reason, status]);

      return sendJson(res, 201, { AppointmentID: result.insertId });
    } catch (err) {
      console.error("Create appointment error:", err);
      return sendJson(res, 500, { message: "Could not create appointment" });
    }
  }
  const matchDeleteAppointment = pathname.match(/^\/api\/appointments\/(\d+)$/);
  if (method === 'DELETE' && matchDeleteAppointment) {
    const appointmentID = matchDeleteAppointment[1];
    try {
      await db.execute(`DELETE FROM appointment WHERE AppointmentID = ?`, [appointmentID]);
      return sendJson(res, 200, { message: 'Appointment canceled successfully' });
    } catch (err) {
      console.error("Error deleting appointment:", err);
      return sendJson(res, 500, { message: "Error canceling appointment" });
    }
  }

  sendJson(res, 404, { message: 'Appointment route not found.' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
