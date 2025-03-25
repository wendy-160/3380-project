import React, { useState, useEffect } from "react";
import axios from "axios";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);  // Ensure this is properly defined
  const [editingAppointmentID, setEditingAppointmentID] = useState(null); // Define this
  const [newAppointment, setNewAppointment] = useState({  // Define this to avoid undefined errors
    doctorID: '',
    dateTime: '',
    reason: '',
    status: 'Scheduled',
  });
  const patientID = localStorage.getItem("patientID");
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/${patientID}`);
        setAppointments(res.data);
      } catch (err) {
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAppointments();
  }, []);

  const handleAddAppointment = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/appointments", {
        patientID,
        doctorID: newAppointment.doctorID,
        dateTime: newAppointment.dateTime,
        reason: newAppointment.reason,
        status: newAppointment.status,
      });
      console.log("Response:", res.data);
      setAppointments((prevAppointments) => [...prevAppointments, res.data]);
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      setError("Failed to add appointment.");
    }
  };
  const handleEditAppointment = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/appointments/${editingAppointmentID}`, {
        ...newAppointment, // Include updated doctorID, dateTime, reason, status
        patientID, // Pass patientID to verify ownership
      });
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.AppointmentID === editingAppointmentID ? { ...appointment, ...newAppointment } : appointment
        )
      );
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update appointment.");
    }
  };
  const handleDeleteAppointment = async (appointmentID) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${appointmentID}`, {
        data: { patientID }, // Send patientID in request body for validation
      });
      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment.AppointmentID !== appointmentID)
      );
    } catch (err) {
      setError("Failed to delete appointment.");
    }
  };

  return (
    <div className="appointments-container">
      <h2>Appointments</h2>

      {loading && <p>Loading appointments...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Displaying the appointments table */}
      {!loading && !error && appointments.length === 0 && <p>No appointments found.</p>}

      <table>
        <thead>
          <tr>
            <th>Appointment ID</th>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Appointment Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.AppointmentID}>
              <td>{appointment.AppointmentID}</td>
              <td>{appointment.PatientName}</td>
              <td>{appointment.DoctorName}</td>
              <td>{appointment.DateTime}</td>
              <td>{appointment.Status}</td>
              <td>
                <button onClick={() => {
                  setIsEditing(true);
                  setEditingAppointmentID(appointment.AppointmentID);
                  setNewAppointment({
                    doctorID: appointment.DoctorID,
                    dateTime: appointment.DateTime,
                    reason: appointment.Reason,
                    status: appointment.Status,
                  });
                }}>
                  Edit
                </button>
                <button onClick={() => handleDeleteAppointment(appointment.AppointmentID)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add or Edit Appointment Form */}
      <h3>{isEditing ? "Edit Appointment" : "Add New Appointment"}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isEditing) {
            handleEditAppointment();
          } else {
            handleAddAppointment();
          }
        }}
      >
        <div>
          <label>Doctor ID:</label>
          <input
            type="text"
            value={newAppointment.doctorID}
            onChange={(e) => setNewAppointment({ ...newAppointment, doctorID: e.target.value })}
          />
        </div>
        <div>
          <label>Appointment Date and Time:</label>
          <input
            type="datetime-local"
            value={newAppointment.dateTime}
            onChange={(e) => setNewAppointment({ ...newAppointment, dateTime: e.target.value })}
          />
        </div>
        <div>
          <label>Reason:</label>
          <textarea
            value={newAppointment.reason}
            onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
          />
        </div>
        <button type="submit">{isEditing ? "Save Changes" : "Add Appointment"}</button>
      </form>
    </div>
  );
};

export default Appointments;