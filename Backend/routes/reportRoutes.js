import db from '../db.js';
import { URL } from 'url';

export async function handleReportRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const doctorPerformanceMatch = pathname.match(/^\/api\/reports\/doctor\/(\d+)$/);
  if (method === 'GET' && doctorPerformanceMatch) {
    const doctorId = doctorPerformanceMatch[1];

    try {
      const [appointments] = await db.query(`
        SELECT COUNT(*) AS TotalAppointments
        FROM appointment
        WHERE DoctorID = ?
      `, [doctorId]);

      const [referrals] = await db.query(`
        SELECT COUNT(*) AS TotalReferrals
        FROM referral
        WHERE ReferringDoctorID = ?
      `, [doctorId]);

      const [completedAppointments] = await db.query(`
        SELECT COUNT(*) AS CompletedAppointments
        FROM appointment
        WHERE DoctorID = ? AND Status = 'Completed'
      `, [doctorId]);

      const [prescriptions] = await db.query(`
        SELECT COUNT(*) AS Prescriptions
        FROM prescription
        WHERE DoctorID = ?
      `, [doctorId]);

      const [tests] = await db.query(`
        SELECT COUNT(*) AS TestsOrdered
        FROM medicaltest
        WHERE DoctorID = ?
      `, [doctorId]);

      return sendJson(res, 200, {
        doctorId: parseInt(doctorId),
        TotalAppointments: appointments[0].TotalAppointments,
        TotalReferrals: referrals[0].TotalReferrals,
        CompletedAppointments: completedAppointments[0].CompletedAppointments,
        Prescriptions: prescriptions[0].Prescriptions,
        TestsOrdered: tests[0].TestsOrdered
      });
    } catch (err) {
      console.error('❌ Error generating doctor performance report:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendJson(res, 404, { message: 'Report route not found' });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
