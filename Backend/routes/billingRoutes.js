import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get billing records for a patient
router.get('/patient/:id', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT b.BillID, b.Amount, b.PaymentStatus, b.InsuranceProvider, b.BillingDate,
             a.DateTime AS AppointmentDate, a.Reason AS AppointmentReason,
             d.FirstName AS DoctorFirstName, d.LastName AS DoctorLastName
      FROM billing b
      JOIN appointment a ON b.AppointmentID = a.AppointmentID
      JOIN doctor d ON a.DoctorID = d.DoctorID
      WHERE b.PatientID = ?
      ORDER BY b.BillingDate DESC
    `, [req.params.id]);
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update payment status
router.put('/:id/status', async (req, res) => {
  try {
    await db.promise().query(
      'UPDATE billing SET PaymentStatus = ? WHERE BillID = ?',
      [req.body.status, req.params.id]
    );
    res.json({ message: 'Payment status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all patients with billing records (for admin)
router.get('/patients', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT DISTINCT p.PatientID, p.FirstName, p.LastName, p.MRN
      FROM patient p
      JOIN billing b ON p.PatientID = b.PatientID
      ORDER BY p.LastName, p.FirstName
    `);
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 