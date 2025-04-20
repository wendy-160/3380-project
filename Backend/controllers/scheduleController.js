import db from '../db.js';

export async function getDoctorScheduleAvailability(req, res) {
  const doctorId = req.params.doctorId;
  try {
    const [rows] = await db.query(`
      SELECT do.OfficeID, do.WorkDays, do.WorkHours,
             o.OfficeName, o.Address
      FROM doctor_office do
      JOIN office o ON do.OfficeID = o.OfficeID
      WHERE do.DoctorID = ?
    `, [doctorId]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (err) {
    console.error('Error fetching schedule availability:', err);
    res.writeHead(500).end(JSON.stringify({ error: err.message }));
  }
}

export async function updateDoctorScheduleAvailability(req, res) {
  const { doctorId, officeId } = req.params;
  let body = '';
  req.on('data', chunk => (body += chunk.toString()));
  req.on('end', async () => {
    try {
      const { WorkDays, WorkHours } = JSON.parse(body);
      await db.query(`
        UPDATE doctor_office
        SET WorkDays = ?, WorkHours = ?
        WHERE DoctorID = ? AND OfficeID = ?
      `, [WorkDays, WorkHours, doctorId, officeId]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Availability updated successfully' }));
    } catch (err) {
      console.error('Error updating availability:', err);
      res.writeHead(400).end(JSON.stringify({ error: err.message }));
    }
  });
}
