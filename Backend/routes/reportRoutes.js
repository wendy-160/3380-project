import db from '../db.js';
import { URL } from 'url';

export async function handleReportRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  const searchParams = parsedUrl.searchParams;
  const startDate = searchParams.get('startDate') || '2024-01-01';
  const endDate = searchParams.get('endDate') || '2024-12-31';

  if (method === 'GET' && pathname === '/api/reports/clinic-profitability') {
    try {
      const [rows] = await db.query(`
        SELECT 
    o.OfficeName,
    COALESCE(SUM(b.Amount), 0) AS TotalRevenue,
    COUNT(DISTINCT a.AppointmentID) AS AppointmentCount
  FROM billing b
  LEFT JOIN appointment a ON b.AppointmentID = a.AppointmentID
  LEFT JOIN office o ON a.OfficeID = o.OfficeID
  WHERE b.BillingDate BETWEEN ? AND ?
  GROUP BY o.OfficeName
      `, [startDate, endDate]);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error generating clinic profitability report:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (method === 'GET' && pathname === '/api/reports/patient-frequency') {
    try {
      const [rows] = await db.query(`
        SELECT 
          CONCAT(p.FirstName, ' ', p.LastName) AS PatientName,
          COUNT(a.AppointmentID) AS VisitCount
        FROM appointment a
        JOIN patient p ON a.PatientID = p.PatientID
        WHERE a.DateTime BETWEEN ? AND ?
        GROUP BY a.PatientID
        ORDER BY VisitCount DESC
      `, [startDate, endDate]);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error generating patient frequency report:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (method === 'GET' && pathname === '/api/reports/doctor-efficiency') {
    try {
      const [rows] = await db.query(`
        SELECT 
          CONCAT(d.FirstName, ' ', d.LastName) AS DoctorName,
          COUNT(DISTINCT a.AppointmentID) AS TotalAppointments,
          COALESCE(ROUND(COUNT(DISTINCT pr.PrescriptionID) / NULLIF(COUNT(DISTINCT a.AppointmentID), 0), 2), 0) AS AvgPrescriptions,
          COALESCE(ROUND(COUNT(DISTINCT mt.TestID) / NULLIF(COUNT(DISTINCT a.AppointmentID), 0), 2), 0) AS AvgTests
        FROM doctor d
        LEFT JOIN appointment a ON a.DoctorID = d.DoctorID AND a.DateTime BETWEEN ? AND ?
        LEFT JOIN prescription pr ON pr.DoctorID = d.DoctorID AND pr.StartDate BETWEEN ? AND ?
        LEFT JOIN medicaltest mt ON mt.DoctorID = d.DoctorID AND mt.OrderDate BETWEEN ? AND ?
        GROUP BY d.DoctorID
      `, [startDate, endDate, startDate, endDate, startDate, endDate]);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error generating doctor efficiency report:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendJson(res, 404, { message: 'Report route not found' });
}
