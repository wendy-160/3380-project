const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Prescription = require('../models/Prescription');

// Set up multer storage for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter for images only (jpeg, png, jpg)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
  fileFilter: fileFilter,
});

// POST route to save a new prescription
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { patientID, appointmentID, doctorID, medicationName, dosage, frequency, startDate, endDate, notes, status } = req.body;

    const imagePath = req.file ? req.file.path : null; // If an image is uploaded, save the path

    const newPrescription = new Prescription({
      patientID,
      appointmentID,
      doctorID,
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      notes,
      status,
      image: imagePath,
    });

    await newPrescription.save();
    res.status(201).json({ message: 'Prescription saved', prescription: newPrescription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save prescription' });
  }
});

// GET route to retrieve all prescriptions
router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.status(200).json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

module.exports = router;
