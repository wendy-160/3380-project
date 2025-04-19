import db from '../db.js';
import { URL } from 'url';

export async function handleAppointmentRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'POST' && pathname === '/api/appointments') {
    try {
      const { PatientID, DoctorID, OfficeID, DateTime, Reason, status } = req.body;
      
      const [doctorRows] = await db.execute(
        `SELECT Specialization FROM doctor WHERE DoctorID = ?`,
        [DoctorID]
      );
  
      if (doctorRows.length === 0) {
        return sendJson(res, 404, { message: 'Doctor not found' });
      }
  
      const specialization = doctorRows[0].Specialization?.trim().toLowerCase();

      if (specialization !== 'primary care physician') {
        const [referralRows] = await db.execute(
          `SELECT * FROM referral 
           WHERE PatientID = ? AND SpecialistDoctorID = ? AND Status = 'Approved'`,
          [PatientID, DoctorID]
        );
  
        if (referralRows.length === 0) {
          return sendJson(res, 403, {
            message: 'You must have an approved referral to book with this specialist.'
          });
        }
      }
  
      const [result] = await db.execute(
        `INSERT INTO appointment (PatientID, DoctorID, OfficeID, DateTime, Reason, Status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [PatientID, DoctorID, OfficeID, DateTime, Reason, status]
      );
  
      return sendJson(res, 201, { AppointmentID: result.insertId });
    } catch (err) {
      console.error("Create appointment error:", err);
      return sendJson(res, 500, { message: "Could not create appointment" });
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
  

  sendJson(res, 404, { message: 'Appointment route not found.' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}