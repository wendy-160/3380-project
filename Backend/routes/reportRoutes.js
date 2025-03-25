import express from 'express';
import db from '../db.js';

const router = express.Router();

// Appointments report
router.get('/appointments', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
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
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patient medical record report
router.get('/patient/:id', async (req, res) => {
  try {
    // Get patient information
    const [patient] = await db.promise().query(
      'SELECT * FROM patient WHERE PatientID = ?',
      [req.params.id]
    );
    
    // Get medical records
    const [records] = await db.promise().query(`
      SELECT 
          mr.MedicalRecordID, mr.VisitDate, mr.Diagnosis, mr.Treatment, mr.Notes,
          d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
      FROM medicalrecord mr
      LEFT JOIN doctor d ON mr.DoctorID = d.DoctorID
      WHERE mr.PatientID = ?
      ORDER BY mr.VisitDate DESC
    `, [req.params.id]);
    
    // Get prescriptions
    const [prescriptions] = await db.promise().query(`
      SELECT 
          pr.PrescriptionID, pr.MedicationName, pr.Dosage, pr.Frequency,
          pr.DatePrescribed, pr.Duration,
          d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
      FROM prescription pr
      JOIN doctor d ON pr.DoctorID = d.DoctorID
      WHERE pr.PatientID = ?
      ORDER BY pr.DatePrescribed DESC
    `, [req.params.id]);
    
    // Get test orders
    const [tests] = await db.promise().query(`
      SELECT 
          t.OrderID, t.OrderDate, t.Status,
          d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
      FROM test_order t
      JOIN doctor d ON t.DoctorID = d.DoctorID
      WHERE t.PatientID = ?
      ORDER BY t.OrderDate DESC
    `, [req.params.id]);
    
    res.json({
      patient: patient[0],
      medicalRecords: records,
      prescriptions: prescriptions,
      tests: tests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor workload report
router.get('/doctors/workload', async (req, res) => {
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
    
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor schedule
router.get('/doctor/:id/schedule', async (req, res) => {
  try {
    // Get doctor info
    const [doctor] = await db.promise().query(
      'SELECT * FROM doctor WHERE DoctorID = ?',
      [req.params.id]
    );
    
    // Get office assignments
    const [offices] = await db.promise().query(`
      SELECT 
          o.OfficeName, o.Address AS OfficeAddress,
          do.WorkDays
      FROM doctor_office do
      JOIN office o ON do.OfficeID = o.OfficeID
      WHERE do.DoctorID = ?
    `, [req.params.id]);
    
    // Get appointment counts
    const { startDate, endDate } = req.query;
    const [appointments] = await db.promise().query(`
      SELECT 
          YEAR(a.DateTime) AS Year,
          MONTH(a.DateTime) AS Month,
          COUNT(*) AS AppointmentCount
      FROM appointment a
      WHERE a.DoctorID = ? AND a.DateTime BETWEEN ? AND ?
      GROUP BY YEAR(a.DateTime), MONTH(a.DateTime)
      ORDER BY Year, Month
    `, [req.params.id, startDate || new Date().getFullYear() + '-01-01', endDate || new Date().getFullYear() + '-12-31']);
    
    res.json({
      doctor: doctor[0],
      offices: offices,
      appointments: appointments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 