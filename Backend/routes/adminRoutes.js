import db from '../db.js';
import { URL } from 'url';
import bcrypt from 'bcryptjs';
const API = process.env.REACT_APP_API_URL;


export async function handleAdminRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const sendJson = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };
  
  if (method === 'GET' && pathname === '/api/admin/billings') {
    const { status, startDate, endDate, search } = Object.fromEntries(parsedUrl.searchParams.entries());

    try {
      let query = `
        SELECT 
          b.BillingID,
          b.PatientID,
          b.AppointmentID,
          b.PrescriptionID,
          b.TestID,
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
      console.error('Error fetching admin billings:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch billing records' }));
    }
  }

  if (method === 'PUT' && pathname.match(/^\/api\/admin\/billings\/\d+$/)) {
    const billId = pathname.split('/').pop();
    let body = req.body;
  
    if (!body) {
      let rawData = '';
      req.on('data', chunk => rawData += chunk);
      req.on('end', async () => {
        try {
          body = JSON.parse(rawData);
          console.log(`Parsed body for PUT /api/admin/billings/${billId}:`, body);
          await handleBillingUpdate(billId, body, res);
        } catch (err) {
          console.error('Invalid JSON in billing update:', err);
          return sendJson(res, 400, { message: 'Invalid JSON format' });
        }
      });
    } else {
      console.log(`Parsed body for PUT /api/admin/billings/${billId}:`, body);
      await handleBillingUpdate(billId, body, res);
    }
  
    return;
  }
  
  if (method === 'POST' && pathname === '/api/admin/billings') {
    let body = req.body;
  
    if (!body) {
      let raw = '';
      req.on('data', chunk => raw += chunk);
      req.on('end', () => {
        try {
          body = JSON.parse(raw);
          return insertBilling(body, res);
        } catch (err) {
          console.error('Failed to parse billing body:', err);
          res.writeHead(400);
          return res.end(JSON.stringify({ message: 'Invalid JSON format' }));
        }
      });
    } else {
      return insertBilling(body, res);
    }
  
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
      console.error('Error fetching patients:', err);
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
      console.error('Error fetching appointments:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch appointments' }));
    }
  }
  if (method === 'GET' && pathname === '/api/admin/clinics') {
    try {
      const [clinics] = await db.query(`
        SELECT OfficeID, OfficeName FROM office ORDER BY OfficeName
      `);
      return sendJson(res, 200, clinics);
    } catch (err) {
      console.error('Error fetching clinics:', err);
      return sendJson(res, 500, { message: 'Failed to fetch clinics' });
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
      console.error('Error fetching prescriptions:', err);
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
      console.error('Error fetching tests:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch tests' }));
    }
  }

  if (method === 'GET' && pathname === '/api/admin/users') {
    try {
      const [rows] = await db.query(`
        SELECT 
        l.UserID,
        l.email AS Email,
        l.role,
        d.DoctorID,
        p.PatientID,
        d.FirstName AS DoctorFirstName,
        d.LastName AS DoctorLastName,
        p.FirstName AS PatientFirstName,
        p.LastName AS PatientLastName,
        CONCAT(l.role, '-', l.UserID) AS CompositeID
      FROM login l
      LEFT JOIN doctor d ON l.UserID = d.UserID
      LEFT JOIN patient p ON l.UserID = p.UserID
      WHERE l.role IN ('Doctor', 'Patient')
      `);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(rows));
    } catch (err) {
      console.error('Error fetching users:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch users' }));
    }
  }

  if (method === 'GET' && pathname === '/api/admin/appointments/full') {
    try {
      const [appointments] = await db.query(`
        SELECT a.AppointmentID, a.DateTime, a.Reason, a.Status, a.DoctorID, a.OfficeID, o.OfficeName,
               p.FirstName AS PatientFirstName, p.LastName AS PatientLastName,
               d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
        FROM appointment a
        JOIN patient p ON a.PatientID = p.PatientID
        JOIN doctor d ON a.DoctorID = d.DoctorID
        JOIN office o ON a.OfficeID = o.OfficeID
        ORDER BY a.DateTime DESC
      `);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(appointments));
    } catch (err) {
      console.error('Error fetching all appointments:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to fetch all appointments' }));
    }
  }

  const userEditMatch = pathname.match(/^\/api\/admin\/users\/(doctor|patient)\/(\d+)$/);
  if (userEditMatch && method === 'PUT') {
    const role = userEditMatch[1];
    const id = userEditMatch[2];

    try {
      const { FirstName, LastName, Email } = req.body || {};
      if (!FirstName || !LastName || !Email) {
        res.writeHead(400);
        return res.end(JSON.stringify({ message: 'Missing required fields' }));
      }

      const table = role === 'doctor' ? 'doctor' : 'patient';
      const idColumn = role === 'doctor' ? 'DoctorID' : 'PatientID';

      await db.query(
        `UPDATE ${table} SET FirstName = ?, LastName = ? WHERE ${idColumn} = ?`,
        [FirstName, LastName, id]
      );

      const [userResult] = await db.query(
        `SELECT UserID FROM ${table} WHERE ${idColumn} = ?`,
        [id]
      );
      const userId = userResult[0]?.UserID;

      if (userId) {
        await db.query(
          `UPDATE login SET email = ? WHERE UserID = ?`,
          [Email, userId]
        );
      }

      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'User updated successfully' }));
    } catch (err) {
      console.error('Error in PUT handler:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to update user' }));
    }
  }

  const matchClinic = pathname.match(/^\/api\/admin\/appointments\/clinic\/(\d+)$/);
  if (method === 'GET' && matchClinic) {
    const clinicId = matchClinic[1];

    try {
      const [rows] = await db.query(`
        SELECT 
          a.AppointmentID,
          a.DateTime,
          a.Status,
          a.Reason,
          o.OfficeID,
          o.OfficeName,
          p.FirstName AS PatientFirstName,
          p.LastName AS PatientLastName,
          d.FirstName AS DoctorFirstName,
          d.LastName AS DoctorLastName
        FROM appointment a
        JOIN office o ON a.OfficeID = o.OfficeID
        JOIN patient p ON a.PatientID = p.PatientID
        JOIN doctor d ON a.DoctorID = d.DoctorID
        WHERE o.OfficeID = ?
        ORDER BY a.DateTime ASC
      `, [clinicId]);

      return sendJson(200, rows);
    } catch (err) {
      console.error("Failed to fetch appointments for clinic:", err);
      return sendJson(500, { message: "Failed to fetch clinic appointments" });
    }
  }

  if (method === 'DELETE' && pathname.match(/^\/api\/admin\/users\/(doctor|patient)\/(\d+)$/)) {
    const [, role, userId] = pathname.match(/^\/api\/admin\/users\/(doctor|patient)\/(\d+)$/);
  
    try {
      if (role === 'doctor') {
        await db.query('DELETE FROM doctor WHERE UserID = ?', [userId]);
      } else if (role === 'patient') {
        await db.query('DELETE FROM patient WHERE UserID = ?', [userId]);
      }
      await db.query('DELETE FROM login WHERE UserID = ?', [userId]);
  
      res.writeHead(204);
      return res.end();
    } catch (err) {
      console.error('Error deleting user:', err);
      res.writeHead(500);
      return res.end(JSON.stringify({ message: 'Failed to delete user' }));
    }
  }

  async function handleBillingUpdate(billId, data, res) {
    const { PaymentStatus, PaymentMethod, PaymentDate, Notes, Amount } = data;

    try {
      const [result] = await db.query(`
        UPDATE billing
        SET PaymentStatus = ?, PaymentMethod = ?, PaymentDate = ?, Notes = ?, Amount = ?
        WHERE BillingID = ?
      `, [PaymentStatus, PaymentMethod, PaymentDate || null, Notes || null, Amount, billId]);
  
      if (result.affectedRows === 0) {
        console.warn("Billing record not found or not updated.");
        return sendJson(res, 404, { message: 'Billing record not found' });
      }
  
      console.log("Billing update successful.");
      return sendJson(res, 200, { message: 'Billing record updated successfully' });
  
    } catch (err) {
      console.error('SQL error during billing update:', err);
      return sendJson(res, 500, { message: 'Failed to update billing record' });
    }
  }

  if (method === 'POST' && pathname === '/api/admin/users/doctor') {
    try {
      const { FirstName, LastName, Email, Username, Password, Specialization, PhoneNumber } = req.body;
  
      if (!FirstName || !LastName || !Email || !Username || !Password || !Specialization) {
        return sendJson(res, 400, { message: 'Missing required fields' });
      }
  
      const hashedPassword = await bcrypt.hash(Password, 10);
  
      const [loginResult] = await db.query(
        'INSERT INTO login (username, email, password, role) VALUES (?, ?, ?, ?)',
        [Username, Email, hashedPassword, 'Doctor']
      );
  
      const userID = loginResult.insertId;
  
      await db.query(
        'INSERT INTO doctor (UserID, FirstName, LastName, Specialization, PhoneNumber) VALUES (?, ?, ?, ?, ?)',
        [userID, FirstName, LastName, Specialization, PhoneNumber || null]
      );
  
      return sendJson(res, 201, { message: 'Doctor account created successfully', UserID: userID });
    } catch (err) {
      console.error('Error creating doctor account:', err);
      return sendJson(res, 500, { message: 'Failed to create doctor account' });
    }
  }
  
  async function insertBilling(body, res) {
    try {
      const {
        PatientID, AppointmentID, PrescriptionID, TestID,
        Amount, PaymentStatus, BillingDate,
        PaymentMethod, PaymentDate, Notes
      } = body;
  
      const [result] = await db.query(`
        INSERT INTO billing 
        (PatientID, AppointmentID, PrescriptionID, TestID, Amount, PaymentStatus, BillingDate, PaymentMethod, PaymentDate, Notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        parseInt(PatientID),
        AppointmentID ? parseInt(AppointmentID) : null,
        PrescriptionID ? parseInt(PrescriptionID) : null,
        TestID ? parseInt(TestID) : null,
        parseFloat(Amount),
        PaymentStatus,
        BillingDate,
        PaymentMethod || null,
        PaymentDate || null,
        Notes || null
      ]);
  
      console.log('Billing record created:', result);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Billing record created', BillingID: result.insertId }));
    } catch (err) {
      console.error('Billing insert error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Failed to create billing record' }));
    }
  }
  
  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Admin route not found' }));
}