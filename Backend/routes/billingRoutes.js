import db from '../db.js';
import { URL } from 'url';

async function getRawJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export async function handleBillingRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  const patientBillingMatch = pathname.match(/^\/api\/billing\/patient\/(\d+)$/);
  if (method === 'GET' && patientBillingMatch) {
    const patientID = patientBillingMatch[1];

    try {
      const [rows] = await db.query(`
        SELECT b.BillingID, b.Amount, b.PaymentStatus, b.PaymentMethod, b.PaymentDate, b.BillingDate, b.Notes,
               a.DateTime AS AppointmentDate, a.Reason AS AppointmentReason,
               d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
        FROM billing b
        LEFT JOIN appointment a ON b.AppointmentID = a.AppointmentID
        LEFT JOIN doctor d ON a.DoctorID = d.DoctorID
        WHERE b.PatientID = ?
        ORDER BY b.BillingDate DESC
      `, [patientID]);

      return sendJson(res, 200, rows);
    } catch (err) {
      console.error("Billing query error:", err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  const updateStatusMatch = pathname.match(/^\/api\/billing\/(\d+)\/status$/);
  if (method === 'PUT' && updateStatusMatch) {
    const billID = updateStatusMatch[1];
    console.log(`Incoming request: PUT ${pathname}`);
    console.log(`Routing to billingRoutes`);
  
    let body = req.body;
  
    if (!body) {
      try {
        body = await getRawJsonBody(req);
      } catch (err) {
        console.error("Failed to parse raw body:", err.message);
        return sendJson(res, 400, { message: 'Invalid JSON' });
      }
    }
  
    console.log(`Parsed body for PUT /api/billing/${billID}/status:`, body);
  
    const { status, paymentMethod, paymentDate } = body;
  
    if (!status || !paymentMethod || !paymentDate) {
      return sendJson(res, 400, { message: 'Missing required fields' });
    }
  
    try {
      const [result] = await db.query(
        `UPDATE billing
         SET PaymentStatus = ?, PaymentDate = ?, PaymentMethod = ?
         WHERE BillingID = ?`,
        [status, paymentDate, paymentMethod, billID]
      );
  
      console.log(`✅ Updated billing record ${billID}`, result);
      return sendJson(res, 200, { message: 'Payment updated successfully' });
    } catch (err) {
      console.error("❌ Billing update failed:", err.message);
      return sendJson(res, 500, { message: 'Database update failed', error: err.message });
    }
  }
  

  if (method === 'GET' && pathname === '/api/billing/patients') {
    try {
      const [rows] = await db.query(`
        SELECT DISTINCT p.PatientID, p.FirstName, p.LastName, p.MRN
        FROM patient p
        JOIN billing b ON p.PatientID = b.PatientID
        ORDER BY p.LastName, p.FirstName
      `);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error("Billing patient list error:", err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendJson(res, 404, { message: 'Billing route not found' });
}