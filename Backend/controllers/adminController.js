import db from '../db.js';

export async function handleAdminAppointments(req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT 
        a.AppointmentID, a.DateTime, a.Status,
        p.FirstName AS PatientName, d.FirstName AS DoctorName
      FROM appointment a
      JOIN patient p ON a.PatientID = p.PatientID
      JOIN doctor d ON a.DoctorID = d.DoctorID
      WHERE a.DateTime < NOW()
      ORDER BY a.DateTime DESC
    `);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function handleAdminUsers(req, res) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const [users] = await db.query(`
        SELECT l.UserID, l.email AS Email, l.role AS Role,
               COALESCE(p.FirstName, d.FirstName) AS FirstName,
               COALESCE(p.LastName, d.LastName) AS LastName
        FROM login l
        LEFT JOIN patient p ON l.UserID = p.UserID
        LEFT JOIN doctor d ON l.UserID = d.UserID
      `);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
    } catch (err) {
      console.error('Error fetching users:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  if (method === 'DELETE') {
    const { userId } = req.params;
    try {
      await db.query('DELETE FROM patient WHERE UserID = ?', [userId]);
      await db.query('DELETE FROM doctor WHERE UserID = ?', [userId]);
      await db.query('DELETE FROM login WHERE UserID = ?', [userId]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User deleted successfully' }));
    } catch (err) {
      console.error('Error deleting user:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}