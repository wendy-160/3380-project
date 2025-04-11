import db from '../db.js';
import { URL } from 'url';

export async function handleAppointmentRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

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
        SELECT * FROM appointment
        WHERE PatientID = ? AND DateTime >= NOW()
        ORDER BY DateTime ASC
      `, [patientID]);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error("Error fetching upcoming appointments:", err);
      return sendJson(res, 500, { message: "Error fetching upcoming appointments" });
    }
  }

  const createRoute = method === 'POST' && pathname === '/api/appointments';
  if (createRoute) {
    try {
      const { PatientID, DoctorID, DateTime, Reason, status } = req.body;
      const [result] = await db.execute(`
        INSERT INTO appointment (PatientID, DoctorID, DateTime, Reason, Status)
        VALUES (?, ?, ?, ?, ?)
      `, [PatientID, DoctorID, DateTime, Reason, status]);
      return sendJson(res, 201, { AppointmentID: result.insertId });
    } catch (err) {
      console.error("Create appointment error:", err);
      return sendJson(res, 500, { message: "Could not create appointment" });
    }
  }

  sendJson(res, 404, { message: 'Appointment route not found.' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
