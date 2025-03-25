import express from 'express';
import db from '../db.js';

const router = express.Router();

// Fetch all prescriptions for a patient
router.get('/patient/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  const query = 'SELECT * FROM prescriptions WHERE PatientID = ?';
  
  db.query(query, [patientId], (err, results) => {
    if (err) {
      console.error('Error fetching prescriptions:', err);
      return res.status(500).json({ message: 'Error fetching prescriptions' });
    }
    res.json(results);
  });
});

// Add a new prescription
router.post('/', (req, res) => {
  const { PatientID, MedicalRecordID, DoctorID, Appointment, MedicationName, Dosage, Frequency, DatePrescribed, Duration } = req.body;
  
  const query = `
    INSERT INTO prescriptions (PatientID, MedicalRecordID, DoctorID, Appointment, MedicationName, Dosage, Frequency, DatePrescribed, Duration) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [PatientID, MedicalRecordID, DoctorID, Appointment, MedicationName, Dosage, Frequency, DatePrescribed, Duration], (err, results) => {
    if (err) {
      console.error('Error adding prescription:', err);
      return res.status(500).json({ message: 'Error adding prescription' });
    }
    res.status(201).json({ message: 'Prescription added successfully', prescriptionId: results.insertId });
  });
});

export default router;
