import db from '../db.js';
import { URL } from 'url';

export async function handleReportRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && pathname === '/api/reports/appointments') {
    const { startDate, endDate } = req.query;

    try {
      const [rows] = await db.promise().query(`
        SELECT 
            o.OfficeName, 
            o.OfficeID,
            YEAR(a.DateTime) AS Year,
            MONTH(a.DateTime) AS Month,
            COUNT(*) AS AppointmentCount
        FROM appointment a
        JOIN office o ON a.OfficeID = o.OfficeID
        WHERE a.DateTime BETWEEN ? AND ?
        GROUP BY o.OfficeID, YEAR(a.DateTime), MONTH(a.DateTime)
        ORDER BY o.OfficeName, Year, Month
      `, [startDate, endDate]);

      return sendJson(res, 200, rows);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  const patientReportMatch = pathname.match(/^\/api\/reports\/patient\/(\d+)$/);
  if (method === 'GET' && patientReportMatch) {
    const patientId = patientReportMatch[1];

    try {
      const [patient] = await db.promise().query(
        'SELECT * FROM patient WHERE PatientID = ?',
        [patientId]
      );

      const [records] = await db.promise().query(`
        SELECT 
            mr.MedicalRecordID, mr.VisitDate, mr.Diagnosis, mr.Treatment, mr.Notes,
            d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
        FROM medicalrecord mr
        LEFT JOIN doctor d ON mr.DoctorID = d.DoctorID
        WHERE mr.PatientID = ?
        ORDER BY mr.VisitDate DESC
      `, [patientId]);

      const [prescriptions] = await db.promise().query(`
        SELECT 
            pr.PrescriptionID, pr.MedicationName, pr.Dosage, pr.Frequency,
            pr.DatePrescribed, pr.Duration,
            d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
        FROM prescription pr
        JOIN doctor d ON pr.DoctorID = d.DoctorID
        WHERE pr.PatientID = ?
        ORDER BY pr.DatePrescribed DESC
      `, [patientId]);

      const [tests] = await db.promise().query(`
        SELECT 
            t.OrderID, t.OrderDate, t.Status,
            d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
        FROM test_order t
        JOIN doctor d ON t.DoctorID = d.DoctorID
        WHERE t.PatientID = ?
        ORDER BY t.OrderDate DESC
      `, [patientId]);

      return sendJson(res, 200, {
        patient: patient[0],
        medicalRecords: records,
        prescriptions: prescriptions,
        tests: tests
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (method === 'GET' && pathname === '/api/reports/doctors/workload') {
    try {
      const [doctors] = await db.promise().query(`
        SELECT 
            d.DoctorID, d.FirstName, d.LastName, d.Specialization,
            COUNT(DISTINCT pda.PatientID) AS PatientCount
        FROM doctor d
        LEFT JOIN patient_doctor_assignment pda ON d.DoctorID = pda.DoctorID
        GROUP BY d.DoctorID
        ORDER BY PatientCount DESC
      `);
      return sendJson(res, 200, doctors);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  const doctorScheduleMatch = pathname.match(/^\/api\/reports\/doctor\/(\d+)\/schedule$/);
  if (method === 'GET' && doctorScheduleMatch) {
    const doctorId = doctorScheduleMatch[1];
    const { startDate, endDate } = req.query;

    try {
      const [doctor] = await db.promise().query(
        'SELECT * FROM doctor WHERE DoctorID = ?',
        [doctorId]
      );

      const [offices] = await db.promise().query(`
        SELECT 
            o.OfficeName, o.Address AS OfficeAddress,
            do.WorkDays
        FROM doctor_office do
        JOIN office o ON do.OfficeID = o.OfficeID
        WHERE do.DoctorID = ?
      `, [doctorId]);

      const [appointments] = await db.promise().query(`
        SELECT 
            YEAR(a.DateTime) AS Year,
            MONTH(a.DateTime) AS Month,
            COUNT(*) AS AppointmentCount
        FROM appointment a
        WHERE a.DoctorID = ? AND a.DateTime BETWEEN ? AND ?
        GROUP BY YEAR(a.DateTime), MONTH(a.DateTime)
        ORDER BY Year, Month
      `, [doctorId, startDate || new Date().getFullYear() + '-01-01', endDate || new Date().getFullYear() + '-12-31']);

      return sendJson(res, 200, {
        doctor: doctor[0],
        offices: offices,
        appointments: appointments
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  return sendJson(res, 404, { message: 'Report route not found' });
}


function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
