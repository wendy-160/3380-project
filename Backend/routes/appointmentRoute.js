// appointmentRoute.js
const express = require("express");
const router = express.Router();
const db = require("../db"); 

// Get appointments for a specific patient
router.get("/:patientID", async (req, res) => {
  const { patientID } = req.params;

  try {
    const query = `
      SELECT a.AppointmentID, a.DateTime, a.Reason, a.Status, 
             p.PatientName, d.DoctorName
      FROM appointments a
      JOIN patients p ON a.PatientID = p.PatientID
      JOIN doctors d ON a.DoctorID = d.DoctorID
      WHERE a.PatientID = ?
      ORDER BY a.DateTime DESC;
    `;

    // Assuming you're using a MySQL database
    const [appointments] = await db.execute(query, [patientID]);

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found." });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching appointments." });
  }
});
router.post("/", async (req, res) => {
    const { patientID, doctorID, dateTime, reason, status } = req.body;
  
    try {
      const query = `
        INSERT INTO appointments (PatientID, DoctorID, DateTime, Reason, Status)
        VALUES (?, ?, ?, ?, ?);
      `;
      const [result] = await db.execute(query, [patientID, doctorID, dateTime, reason, status]);
  
      // Return the new appointment with AppointmentID
      const newAppointment = {
        AppointmentID: result.insertId,
        PatientID: patientID,
        DoctorID: doctorID,
        DateTime: dateTime,
        Reason: reason,
        Status: status,
      };
  
      res.status(201).json(newAppointment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error adding appointment." });
    }
  });

  router.put("/:appointmentID", async (req, res) => {
    const { appointmentID } = req.params;
    const { doctorID, dateTime, reason, status } = req.body;
  
    try {
      const query = `
        UPDATE appointments
        SET DoctorID = ?, DateTime = ?, Reason = ?, Status = ?
        WHERE AppointmentID = ? AND PatientID = ?;
      `;
      const [result] = await db.execute(query, [doctorID, dateTime, reason, status, appointmentID, req.body.patientID]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Appointment not found or unauthorized." });
      }
  
      res.json({ message: "Appointment updated successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating appointment." });
    }
  });

  router.delete("/:appointmentID", async (req, res) => {
    const { appointmentID } = req.params;
    const { patientID } = req.body;
  
    try {
      const query = `
        DELETE FROM appointments
        WHERE AppointmentID = ? AND PatientID = ?;
      `;
      const [result] = await db.execute(query, [appointmentID, patientID]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Appointment not found or unauthorized." });
      }
  
      res.json({ message: "Appointment deleted successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error deleting appointment." });
    }
  });

  router.post("/api/appointments", async (req, res) => {
    console.log("Received data:", req.body); // Log incoming request data
  
    const { patientID, doctorID, dateTime, reason, status } = req.body;
    if (!patientID || !doctorID || !dateTime || !reason || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    try {
      const newAppointment = await db.query(
        "INSERT INTO appointment (PatientID, DoctorID, DateTime, Reason, Status) VALUES (?, ?, ?, ?, ?)",
        [patientID, doctorID, dateTime, reason, status]
      );
      res.status(201).json({ message: "Appointment added successfully" });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ message: "Database error" });
    }
  });


module.exports = router;
