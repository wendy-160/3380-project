import React, { useState, useEffect } from 'react';
import { FiUser, FiCalendar, FiClock, FiUserPlus, FiX, FiPhone, FiMail } from 'react-icons/fi';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [primaryPhysician, setPrimaryPhysician] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [doctorOffices, setDoctorOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);

  const currentPatientID = JSON.parse(localStorage.getItem('user'))?.PatientID;

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');

        const profileRes = await fetch(`/api/patients/${currentPatientID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        setProfile(profileData);

        const doctorRes = await fetch(`/api/patients/${currentPatientID}/primary-physician`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (doctorRes.ok) {
          const doctorData = await doctorRes.json();
          setPrimaryPhysician(doctorData);

          const officesRes = await fetch(`/api/doctors/${doctorData.DoctorID}/offices`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (officesRes.ok) {
            const officeData = await officesRes.json();
            setDoctorOffices(officeData);
          }
        }
        
        const appointmentRes = await fetch(`/api/appointments/patient/${currentPatientID}/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingAppointments(await appointmentRes.json());

        const prescriptionRes = await fetch(`/api/prescriptions/patient/${currentPatientID}/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrescriptions(await prescriptionRes.json());
      } catch (err) {
        console.error("Error fetching patient data:", err);
      }
    };

    if (currentPatientID) fetchPatientData();
  }, [currentPatientID]);

  const handleDateSelection = async (date) => {
    setSelectedDate(date);
    if (!primaryPhysician?.DoctorID) {
      console.warn("Primary physician not available");
      return;
    }
    const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }); // e.g. 'Mon'
    const filtered = doctorOffices.filter(office =>
      office.WorkDays?.split(',').map(day => day.trim()).includes(selectedDay)
    );
    setFilteredOffices(filtered);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/appointments/available/${primaryPhysician.DoctorID}/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAvailableTimeSlots(data);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const handleCreateAppointment = async () => {
    const selectedTime = document.getElementById("time").value;
    const reason = document.getElementById("reason").value;
  
    if (!selectedTime || !reason) return alert("Time and reason required.");
  
    try {
      const token = localStorage.getItem('token');
  
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          PatientID: currentPatientID,
          DoctorID: primaryPhysician?.DoctorID,
          OfficeID: document.getElementById("office").value,
          DateTime: selectedTime,
          Reason: reason,
          status: 'Scheduled'
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unknown error");
      }
  
      setIsAppointmentModalOpen(false);
      const updatedAppointments = await fetch(`/api/appointments/patient/${currentPatientID}/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appointmentsData = await updatedAppointments.json();
      setUpcomingAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to schedule:', error);
      alert("Failed to schedule appointment");
    }
  };
  
  
  

  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="patient-dashboard">
      <h1 className="dashboard-title">Patient Dashboard</h1>

      <div className="dashboard-grid">
        {/* Profile */}
        <div className="dashboard-card profile-section">
          <div className="card-header"><FiUser className="card-icon" /><h2>My Profile</h2></div>
          {profile && (
            <div className="profile-details">
              <p>{profile.FirstName} {profile.LastName}</p>
              <p><FiPhone /> {profile.PhoneNumber}</p>
              <p><FiMail /> {profile.Email}</p>
            </div>
          )}
        </div>

        {/* Primary Doctor */}
        <div className="dashboard-card physician-section">
          <div className="card-header"><FiUserPlus className="card-icon" /><h2>My Primary Physician</h2></div>
          {primaryPhysician ? (
            <div>
              <h3>Dr. {primaryPhysician.FirstName} {primaryPhysician.LastName}</h3>
              <p>{primaryPhysician.Specialization}</p>
              <p><FiPhone /> {primaryPhysician.PhoneNumber}</p>
            </div>
          ) : (
            <p>Primary physician not assigned</p>
          )}
        </div>

        {/* Appointments */}
        <div className="dashboard-card appointments-section">
          <div className="card-header"><FiCalendar className="card-icon" /><h2>Appointments</h2></div>
          <button className="schedule-appointment-btn" onClick={() => setIsAppointmentModalOpen(true)}>Schedule New Appointment</button>
          <div className="appointments-list">
            {upcomingAppointments.map(appt => (
              <div key={appt.AppointmentID} className="appointment-item">
                <div><FiClock /> {formatDateTime(appt.DateTime)}</div>
                <div>{appt.Reason} - {appt.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptions */}
        <div className="dashboard-card prescriptions-section">
          <div className="card-header"><h2>Prescriptions</h2></div>
          {prescriptions.map(p => (
            <div key={p.PrescriptionID}>
              <h3>{p.MedicationName}</h3>
              <p>{p.Dosage} - {p.Instructions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isAppointmentModalOpen && (
        <div className="modal-overlay">
          <div className="appointment-modal">
            <div className="modal-header">
              <h2>Schedule Appointment</h2>
              <button onClick={() => setIsAppointmentModalOpen(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateAppointment(); }}>
                <label>Date</label>
                <input
                  type="date"
                  id="date"
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleDateSelection(e.target.value)}
                  disabled={!primaryPhysician}
                />
                {selectedDate && (
                  <>
                    <label>Time</label>
                    <select id="time">
                      <option value="">Select a time</option>
                      {availableTimeSlots.map((slot, idx) => (
                        <option key={idx} value={slot}>
                          {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </option>
                      ))}
                    </select>
                    <label>Clinic</label>
                    <select id="office">
                      <option value="">Choose a clinic</option>
                      {filteredOffices.map((office) => (
                        <option key={office.OfficeID} value={office.OfficeID}>
                          {office.OfficeName} - {office.Address}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <label>Reason</label>
                <textarea id="reason" rows="3" placeholder="Describe reason for your visit" />
                <button type="submit">Schedule</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;