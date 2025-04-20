import db from '../db.js';
import { URL } from 'url';
const API = process.env.REACT_APP_API_URL;


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
  let body = '';

  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body);
      const { status, paymentDate, paymentMethod } = parsed;

      console.log("🔁 Incoming Payment Update Request");
      console.log("➡️ Bill ID:", billID);
      console.log("➡️ New Status:", status);
      console.log("➡️ Payment Date:", paymentDate);
      console.log("➡️ Payment Method:", paymentMethod);

      const [result] = await db.query(
        'UPDATE billing SET PaymentStatus = ?, PaymentDate = ?, PaymentMethod = ? WHERE BillingID = ?',
        [status, paymentDate, paymentMethod, billID]
      );

      console.log("✅ Database Update Success:", result);

      return sendJson(res, 200, {
        message: 'Payment updated successfully',
        updatedBillID: billID,
        newStatus: status,
        paymentMethod,
        paymentDate
      });
    } catch (err) {
      console.error("❌ Payment Update Error:", err);
      return sendJson(res, 500, { error: 'Failed to update billing status', details: err.message });
    }
  });

  return;
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