import db from '../db.js';
import { URL } from 'url';

export async function handleAdminRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/api/admin/billings') {
    const { status, startDate, endDate, search } = Object.fromEntries(parsedUrl.searchParams.entries());

    try {
      let query = `
        SELECT 
          b.BillingID,
          CONCAT(p.FirstName, ' ', p.LastName) AS PatientName,
          CASE
            WHEN b.PrescriptionID IS NOT NULL THEN 'Prescription'
            WHEN b.TestID IS NOT NULL THEN 'Medical Test'
            WHEN b.AppointmentID IS NOT NULL THEN 'Appointment'
            ELSE 'General Billing'
          END AS ServiceType,
          b.Amount,
          b.PaymentStatus,
          b.BillingDate,
          b.PaymentDate,
          b.PaymentMethod,
          b.Notes
        FROM billing b
        JOIN patient p ON b.PatientID = p.PatientID
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ` AND b.PaymentStatus = ?`;
        params.push(status);
      }
      if (startDate) {
        query += ` AND b.BillingDate >= ?`;
        params.push(startDate);
      }
      if (endDate) {
        query += ` AND b.BillingDate <= ?`;
        params.push(endDate);
      }
      if (search) {
        query += ` AND (p.FirstName LIKE ? OR p.LastName LIKE ? OR p.PatientID LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY b.BillingDate DESC`;

      const [rows] = await db.query(query, params);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    } catch (err) {
      console.error('❌ Error fetching admin billings:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch billing records' }));
    }
  }

  if (method === 'PUT' && pathname.match(/^\/api\/admin\/billings\/\d+$/)) {
    const billId = pathname.split('/').pop();
    let rawBody = '';

    req.on('data', chunk => rawBody += chunk);
    req.on('end', async () => {
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }

      const { PaymentStatus, PaymentMethod, PaymentDate, Notes } = body;
      try {
        const [result] = await db.query(`
          UPDATE billing
          SET PaymentStatus = ?, PaymentMethod = ?, PaymentDate = ?, Notes = ?
          WHERE BillingID = ?
        `, [PaymentStatus, PaymentMethod, PaymentDate || null, Notes || null, billId]);

        if (result.affectedRows === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ message: 'Billing record not found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Billing record updated successfully' }));
      } catch (err) {
        console.error('❌ SQL error during billing update:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Failed to update billing record' }));
      }
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/admin/billings') {
    let rawBody = '';
    req.on('data', chunk => rawBody += chunk);
    req.on('end', async () => {
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid JSON' }));
      }

      const {
        PatientID, AppointmentID, PrescriptionID, TestID,
        Amount, PaymentStatus, BillingDate,
        PaymentMethod, PaymentDate, Notes
      } = body;

      try {
        const [result] = await db.query(`
          INSERT INTO billing 
          (PatientID, AppointmentID, PrescriptionID, TestID, Amount, PaymentStatus, BillingDate, PaymentMethod, PaymentDate, Notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          PatientID,
          AppointmentID || null,
          PrescriptionID || null,
          TestID || null,
          Amount,
          PaymentStatus,
          BillingDate,
          PaymentMethod || null,
          PaymentDate || null,
          Notes || null
        ]);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Billing record created', BillingID: result.insertId }));
      } catch (err) {
        console.error('❌ Error creating billing record:', err);
        res.writeHead(500);
        return res.end(JSON.stringify({ message: 'Failed to create billing record' }));
      }
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/patients') {
    try {
      const [rows] = await db.query(`
        SELECT PatientID, FirstName, LastName FROM patient
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    } catch (err) {
      console.error('❌ Error fetching patients:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch patients' }));
    }
  }

  if (method === 'GET' && pathname === '/api/admin/appointments') {
    try {
      const [rows] = await db.query(`
        SELECT AppointmentID, DateTime AS AppointmentDate FROM appointment
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch appointments' }));
    }
  }

  if (method === 'GET' && pathname === '/api/admin/prescriptions') {
    try {
      const [rows] = await db.query(`
        SELECT PrescriptionID, MedicationName AS MedicineName FROM prescription
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    } catch (err) {
      console.error('❌ Error fetching prescriptions:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch prescriptions' }));
    }
  }

  if (method === 'GET' && pathname === '/api/admin/tests') {
    try {
      const [rows] = await db.query(`
        SELECT TestID, TestName FROM medicaltest
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    } catch (err) {
      console.error('❌ Error fetching tests:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch tests' }));
    }
  }

  if (method === 'GET' && pathname === '/api/admin/users') {
    try {
      const [doctors] = await db.query(`
        SELECT d.DoctorID AS ID, CONCAT('doctor-', d.DoctorID) AS CompositeID, d.FirstName, d.LastName, l.email AS Email, 'doctor' AS role
        FROM doctor d
        JOIN login l ON d.UserID = l.UserID
      `);

      const [patients] = await db.query(`
        SELECT p.PatientID AS ID, CONCAT('patient-', p.PatientID) AS CompositeID, p.FirstName, p.LastName, l.email AS Email, 'patient' AS role
        FROM patient p
        JOIN login l ON p.UserID = l.UserID
      `);

      const users = [...doctors, ...patients];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(users));
    } catch (err) {
      console.error('❌ Error fetching users:', err);
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
      console.error('❌ Error fetching past appointments:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch past appointments' }));
    }
  }

  const userEditMatch = pathname.match(/^\/api\/admin\/users\/(doctor|patient)\/(\d+)$/);
  if (userEditMatch && method === 'PUT') {
    const role = userEditMatch[1];
    const id = userEditMatch[2];

    try {
      const { FirstName, LastName } = req.body || {};
      if (!FirstName || !LastName) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: 'Missing FirstName or LastName' }));
      }

      const table = role === 'doctor' ? 'doctor' : 'patient';
      const idColumn = role === 'doctor' ? 'DoctorID' : 'PatientID';

      const [result] = await db.query(
        `UPDATE ${table} SET FirstName = ?, LastName = ? WHERE ${idColumn} = ?`,
        [FirstName, LastName, id]
      );

      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'User updated successfully' }));
    } catch (err) {
      console.error('❌ Error in PUT handler:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to update user' }));
    }
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
      console.error('❌ Error deleting user:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to delete user' }));
    }
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Admin route not found' }));
}
