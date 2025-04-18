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

  const doctorPerformanceMatch = pathname.match(/^\/api\/reports\/doctor\/(\d+)$/);
  if (method === 'GET' && doctorPerformanceMatch) {
    const doctorId = doctorPerformanceMatch[1];
    const searchParams = parsedUrl.searchParams;
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2024-12-31';

    try {
      const [appointments] = await db.query(`
        SELECT COUNT(*) AS TotalAppointments
        FROM appointment
        WHERE DoctorID = ? AND DateTime BETWEEN ? AND ?
      `, [doctorId, startDate, endDate]);

      const [referrals] = await db.query(`
        SELECT COUNT(*) AS TotalReferrals
        FROM referral
        WHERE ReferringDoctorID = ? AND Date BETWEEN ? AND ?
      `, [doctorId, startDate, endDate]);

      const [completedAppointments] = await db.query(`
        SELECT COUNT(*) AS CompletedAppointments
        FROM appointment
        WHERE DoctorID = ? AND Status = 'Completed' AND DateTime BETWEEN ? AND ?
      `, [doctorId, startDate, endDate]);

      const [prescriptions] = await db.query(`
        SELECT COUNT(*) AS Prescriptions
        FROM prescription
        WHERE DoctorID = ? AND StartDate BETWEEN ? AND ?
      `, [doctorId, startDate, endDate]);

      const [tests] = await db.query(`
        SELECT COUNT(*) AS TestsOrdered
        FROM medicaltest
        WHERE DoctorID = ? AND OrderDate BETWEEN ? AND ?
      `, [doctorId, startDate, endDate]);

      return sendJson(res, 200, {
        doctorId: parseInt(doctorId),
        TotalAppointments: appointments[0].TotalAppointments,
        TotalReferrals: referrals[0].TotalReferrals,
        CompletedAppointments: completedAppointments[0].CompletedAppointments,
        Prescriptions: prescriptions[0].Prescriptions,
        TestsOrdered: tests[0].TestsOrdered
      });
    } catch (err) {
      console.error('Error generating doctor performance report:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (method === 'GET' && pathname === '/api/reports/clinic-utilization') {
    const searchParams = parsedUrl.searchParams;
    const aggregation = searchParams.get('aggregation') || 'Monthly';
    const officeId = searchParams.get('officeId');
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2024-12-31';

    let groupByClause = '';
    let selectDateParts = '';
    let orderByClause = '';

    switch (aggregation) {
      case 'Daily':
        selectDateParts = 'DATE(a.DateTime) AS Date';
        groupByClause = 'GROUP BY o.OfficeID, Date';
        orderByClause = 'ORDER BY o.OfficeID, Date';
        break;
      case 'Weekly':
        selectDateParts = 'YEAR(a.DateTime) AS Year, WEEK(a.DateTime) AS Week';
        groupByClause = 'GROUP BY o.OfficeID, Year, Week';
        orderByClause = 'ORDER BY o.OfficeID, Year, Week';
        break;
      case 'Monthly':
      default:
        selectDateParts = 'YEAR(a.DateTime) AS Year, MONTH(a.DateTime) AS Month';
        groupByClause = 'GROUP BY o.OfficeID, Year, Month';
        orderByClause = 'ORDER BY o.OfficeID, Year, Month';
        break;
    }

    try {
      const query = `
        SELECT 
          o.OfficeName, o.OfficeID,
          ${selectDateParts},
          COUNT(a.AppointmentID) AS AppointmentCount
        FROM appointment a
        JOIN office o ON a.OfficeID = o.OfficeID
        WHERE a.DateTime BETWEEN ? AND ?
        ${officeId ? 'AND o.OfficeID = ?' : ''}
        ${groupByClause}
        ${orderByClause}
      `;

      const queryParams = officeId ? [startDate, endDate, officeId] : [startDate, endDate];

      const [rows] = await db.query(query, queryParams);

      return sendJson(res, 200, rows);
    } catch (err) {
      console.error(' Error generating clinic utilization report:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (method === 'GET' && pathname.startsWith('/api/reports/referral-outcomes')) {
    const searchParams = parsedUrl.searchParams;
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2024-12-31';
    const doctorId = searchParams.get('doctorId') || null;
    const status = searchParams.get('status') || 'Approved';
    const specialization = searchParams.get('specialization') || null;

    try {
      const query = `
        SELECT 
          r.ReferralID,
          CONCAT(p.FirstName, ' ', p.LastName) AS PatientName,
          CONCAT(s.FirstName, ' ', s.LastName) AS SpecialistName,
          r.Status AS ReferralStatus,
          CASE WHEN a.AppointmentID IS NOT NULL THEN 'Yes' ELSE 'No' END AS AppointmentScheduled,
          a.DateTime AS AppointmentDate
        FROM referral r
        JOIN patient p ON r.PatientID = p.PatientID
        JOIN doctor s ON r.SpecialistDoctorID = s.DoctorID
        LEFT JOIN appointment a ON a.PatientID = r.PatientID AND a.DoctorID = r.SpecialistDoctorID
        WHERE r.Status = ?
          AND DATE(r.Date) BETWEEN ? AND ?
          ${doctorId ? 'AND r.SpecialistDoctorID = ?' : ''}
          ${specialization ? 'AND s.Specialization = ?' : ''}
        ORDER BY r.ReferralID DESC
      `;

      const params = [status, startDate, endDate];
      if (doctorId) params.push(doctorId);
      if (specialization) params.push(specialization);

      const [rows] = await db.query(query, params);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error generating referral outcome report with filters:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendJson(res, 404, { message: 'Report route not found' });
}