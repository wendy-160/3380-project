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
  const currentPatientID = JSON.parse(localStorage.getItem('user'))?.PatientID;

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch patient profile
        const profileResponse = await fetch(`/api/patients/${currentPatientID}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch primary physician
        const physicianResponse = await fetch(`/api/patients/${currentPatientID}/primary-physician`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const physicianData = await physicianResponse.json();
        setPrimaryPhysician(physicianData);

        // Fetch upcoming appointments
        const appointmentsResponse = await fetch(`/api/appointments/patient/${currentPatientID}/upcoming`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appointmentsData = await appointmentsResponse.json();
        setUpcomingAppointments(appointmentsData);

        // Fetch prescriptions
        const prescriptionsResponse = await fetch(`/api/prescriptions/patient/${currentPatientID}/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const prescriptionsData = await prescriptionsResponse.json();
        setPrescriptions(prescriptionsData);

      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    if (currentPatientID) fetchPatientData();
  }, [currentPatientID]);

  const handleDateSelection = async (date) => {
    try {
      const token = localStorage.getItem('token');
      setSelectedDate(date);
      
      // Fetch available time slots for the selected date
      const response = await fetch(`/api/appointments/available/${primaryPhysician.DoctorID}/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const timeSlots = await response.json();
      setAvailableTimeSlots(timeSlots);
    } catch (error) {
      console.error('Error fetching available time slots:', error);
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...appointmentData,
          PatientID: currentPatientID,
          DoctorID: primaryPhysician.DoctorID,
          ScheduledVia: 'WebPortal',
          status: 'Scheduled'
        })
      });

      if (response.ok) {
        setIsAppointmentModalOpen(false);
        // Refresh appointments list
        const updatedAppointments = await fetch(`/api/appointments/patient/${currentPatientID}/upcoming`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appointmentsData = await updatedAppointments.json();
        setUpcomingAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="patient-dashboard">
      <h1 className="dashboard-title">Patient Dashboard</h1>

      <div className="dashboard-grid">
        {/* Profile Section */}
        <div className="dashboard-card profile-section">
          <div className="card-header">
            <FiUser className="card-icon" />
            <h2 className="card-title">My Profile</h2>
          </div>
          {profile && (
            <div className="profile-details">
              <p className="profile-name">{profile.FirstName} {profile.LastName}</p>
              <p className="profile-info">
                <FiPhone className="info-icon" />
                {profile.PhoneNumber}
              </p>
              <p className="profile-info">
                <FiMail className="info-icon" />
                {profile.Email}
              </p>
            </div>
          )}
        </div>

        {/* Primary Physician Section */}
        <div className="dashboard-card physician-section">
          <div className="card-header">
            <FiUserPlus className="card-icon" />
            <h2 className="card-title">My Primary Physician</h2>
          </div>
          {primaryPhysician && (
            <div className="physician-details">
              <h3>Dr. {primaryPhysician.FirstName} {primaryPhysician.LastName}</h3>
              <p className="specialization">{primaryPhysician.Specialization}</p>
              <p className="contact-info">
                <FiPhone className="info-icon" />
                {primaryPhysician.PhoneNumber}
              </p>
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className="dashboard-card appointments-section">
          <div className="card-header">
            <FiCalendar className="card-icon" />
            <h2 className="card-title">My Appointments</h2>
          </div>
          <button 
            className="schedule-appointment-btn"
            onClick={() => setIsAppointmentModalOpen(true)}
          >
            Schedule New Appointment
          </button>
          <div className="appointments-list">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.AppointmentID} className="appointment-item">
                <div className="appointment-time">
                  <FiClock className="time-icon" />
                  <span>{formatDateTime(appointment.DateTime)}</span>
                </div>
                <div className="appointment-details">
                  <p className="appointment-reason">{appointment.Reason}</p>
                  <p className="appointment-status">{appointment.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptions Section */}
        <div className="dashboard-card prescriptions-section">
          <div className="card-header">
            <h2 className="card-title">Current Prescriptions</h2>
          </div>
          <div className="prescriptions-list">
            {prescriptions.map(prescription => (
              <div key={prescription.PrescriptionID} className="prescription-item">
                <h3 className="medication-name">{prescription.MedicationName}</h3>
                <p className="dosage">{prescription.Dosage}</p>
                <p className="instructions">{prescription.Instructions}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Appointment Scheduling Modal */}
      {isAppointmentModalOpen && (
        <div className="modal-overlay">
          <div className="appointment-modal">
            <div className="modal-header">
              <h2>Schedule Appointment</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setIsAppointmentModalOpen(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <form className="appointment-form">
                <div className="form-group">
                  <label htmlFor="date">Select Date</label>
                  <input
                    type="date"
                    id="date"
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleDateSelection(e.target.value)}
                  />
                </div>

                {selectedDate && (
                  <div className="form-group">
                    <label htmlFor="time">Available Time Slots</label>
                    <select id="time" className="form-control">
                      <option value="">Select a time</option>
                      {availableTimeSlots.map((slot, index) => (
                        <option key={index} value={slot}>
                          {new Date(slot).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="reason">Reason for Visit</label>
                  <textarea 
                    id="reason" 
                    className="form-control" 
                    rows="3"
                    placeholder="Please describe the reason for your visit"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsAppointmentModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      const formData = {
                        DateTime: document.getElementById('time').value,
                        Reason: document.getElementById('reason').value,
                      };
                      handleCreateAppointment(formData);
                    }}
                  >
                    Schedule Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;