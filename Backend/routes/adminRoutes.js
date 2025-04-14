import db from '../db.js';
import { URL } from 'url';

export async function handleAdminRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/api/admin/users') {
    try {
      const [doctors] = await db.query(`
        SELECT d.DoctorID AS ID, d.FirstName, d.LastName, l.email AS Email, 'doctor' AS role
        FROM doctor d
        JOIN login l ON d.UserID = l.UserID
      `);
      const [patients] = await db.query(`
        SELECT p.PatientID AS ID, p.FirstName, p.LastName, l.email AS Email, 'patient' AS role
        FROM patient p
        JOIN login l ON p.UserID = l.UserID
      `);
      const users = [...doctors, ...patients];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(users));
    } catch (err) {
      console.error('Error fetching users:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch users' }));
    }
  }

  if (method === 'GET' && pathname === '/api/admin/appointments/past') {
    try {
      const [appointments] = await db.query(`
        SELECT a.AppointmentID, a.DateTime, a.Reason, a.Status,
               p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
               d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
        FROM appointment a
        JOIN patient p ON a.PatientID = p.PatientID
        JOIN doctor d ON a.DoctorID = d.DoctorID
        WHERE a.DateTime < NOW()
        ORDER BY a.DateTime DESC
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(appointments));
    } catch (err) {
      console.error('Error fetching past appointments:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch past appointments' }));
    }
  }

  const userEditMatch = pathname.match(/^\/api\/admin\/users\/(doctor|patient)\/(\d+)$/);
  if (userEditMatch && method === 'PUT') {
    const role = userEditMatch[1];
    const id = userEditMatch[2];
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      const { FirstName, LastName } = JSON.parse(body);
      try {
        const table = role === 'doctor' ? 'doctor' : 'patient';
        const idColumn = role === 'doctor' ? 'DoctorID' : 'PatientID';
        await db.query(`UPDATE ${table} SET FirstName = ?, LastName = ? WHERE ${idColumn} = ?`, [FirstName, LastName, id]);
        res.writeHead(200);
        return res.end(JSON.stringify({ message: 'User updated' }));
      } catch (err) {
        console.error('Error updating user:', err);
        res.writeHead(500);
        return res.end(JSON.stringify({ message: 'Failed to update user' }));
      }
    });
    return;
  }

  if (userEditMatch && method === 'DELETE') {
    const role = userEditMatch[1];
    const id = userEditMatch[2];
    try {
      const table = role === 'doctor' ? 'doctor' : 'patient';
      const idColumn = role === 'doctor' ? 'DoctorID' : 'PatientID';
      await db.query(`DELETE FROM ${table} WHERE ${idColumn} = ?`, [id]);
      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'User deleted' }));
    } catch (err) {
      console.error('Error deleting user:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to delete user' }));
    }
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Admin route not found' }));
}
