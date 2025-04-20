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
    console.error('❌ Error fetching schedule availability:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function updateDoctorScheduleAvailability(req, res) {
  const { doctorId, officeId } = req.params;
  let body = req.body;

  if (!body) {
    let rawData = '';
    req.on('data', chunk => rawData += chunk);
    req.on('end', async () => {
      try {
        body = JSON.parse(rawData);
        await processUpdate(doctorId, officeId, body, res);
      } catch (err) {
        console.error('Failed to parse JSON body:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }
    });
  } else {
    await processUpdate(doctorId, officeId, body, res);
  }
}

async function processUpdate(doctorId, officeId, body, res) {
  const { WorkDays, WorkHours } = body;

  if (!WorkDays || !WorkHours) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Missing WorkDays or WorkHours' }));
  }

  try {
    const [result] = await db.query(
      `UPDATE doctor_office
       SET WorkDays = ?, WorkHours = ?
       WHERE DoctorID = ? AND OfficeID = ?`,
      [WorkDays, WorkHours, doctorId, officeId]
    );

    console.log(`Rows updated: ${result.affectedRows}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Availability updated successfully' }));
  } catch (err) {
    console.error('Database update error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Database error', error: err.message }));
  }
}

