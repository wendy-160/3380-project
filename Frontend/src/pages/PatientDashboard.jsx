import React, { useState, useEffect } from 'react';
import { FiUser, FiCalendar, FiUserPlus, FiX, FiPhone, FiMail } from 'react-icons/fi';
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');
  const [referredSpecialists, setReferredSpecialists] = useState([]);


  const currentPatientID = JSON.parse(localStorage.getItem('user'))?.PatientID;

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('authToken');

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
        const referralRes = await fetch(`/api/referrals/patient/${currentPatientID}/approved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (referralRes.ok) {
          const specialists = await referralRes.json();
          setReferredSpecialists(specialists);
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

  const handleSpecialistChange = async (e) => {
    const doctorId = e.target.value;
    if (!doctorId) return;
  
    const selectedDate = document.getElementById("date")?.value;
    if (!selectedDate) return;
  
    try {
      const token = localStorage.getItem('authToken');
  
      const [slotsRes, officeRes] = await Promise.all([
        fetch(`/api/appointments/available/${doctorId}/${selectedDate}`),
        fetch(`/api/doctors/${doctorId}/offices`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
  
      const slots = await slotsRes.json();
      const officeData = await officeRes.json();
  
      setAvailableTimeSlots(slots);
      setFilteredOffices(officeData);
    } catch (err) {
      console.error("Error fetching specialist info:", err);
    }
  };
  const handleDateSelection = async (date) => {
    setSelectedDate(date);
    const selectedDoctorId = document.getElementById("specialist")?.value || primaryPhysician?.DoctorID;
    if (!selectedDoctorId) return;
  
    const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  
    try {
      const [officeRes, slotRes] = await Promise.all([
        fetch(`/api/doctors/${selectedDoctorId}/offices`),
        fetch(`/api/appointments/available/${selectedDoctorId}/${date}`)
      ]);
      const officeData = await officeRes.json();
      const slotData = await slotRes.json();
  
      setFilteredOffices(
        officeData.filter(office =>
          office.WorkDays?.split(',').map(day => day.trim()).includes(selectedDay)
        )
      );
      setAvailableTimeSlots(slotData);
    } catch (err) {
      console.error("Error fetching office/timeslot data:", err);
    }
  };

  const handleCreateAppointment = async () => {
    const selectedTime = document.getElementById("time").value;
    const reason = document.getElementById("reason").value;
  
    if (!selectedTime || !reason) return alert("Time and reason required.");
  
    try {
      const token = localStorage.getItem('authToken');
  
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          PatientID: currentPatientID,
          DoctorID: document.getElementById("specialist").value || primaryPhysician?.DoctorID,
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
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
  
    try {
      const token = localStorage.getItem('authToken');
  
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }
      
      const updatedAppointments = await fetch(`/api/appointments/patient/${currentPatientID}/upcoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appointmentsData = await updatedAppointments.json();
      setUpcomingAppointments(appointmentsData);
  
    } catch (error) {
      console.error('Cancel appointment error:', error);
      alert("Unable to cancel appointment");
    }
  };
  console.log("currentPatientID:", currentPatientID);
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("authToken");
    console.log("Read token from localStorage:", token);

    if (!token) {
      alert("No auth token found. Please log in again.");
      return;
    }
    try {
      console.log("Making PUT request to:", `/api/patients/${currentPatientID}`);
      const response = await fetch(`http://localhost:5000/api/patients/${currentPatientID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: updatedEmail,
          address: updatedAddress,
        }),
      });
  
      console.log("PUT request sent. Status:", response.status);
  
      const result = await response.json();
      console.log("Server response:", result);
  
      if (!response.ok) {
        throw new Error(result.message || "Update failed");
      }
  
      setProfile(result);
      setIsEditingProfile(false);
      setUpdatedEmail(result.Email);
      setUpdatedAddress(result.Address);
  
      console.log("Profile updated.");
    } catch (err) {
      console.error("Failed to update profile:", err.message);
      alert("Could not update profile info");
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
              <p><FiMail /> {profile.email}</p>
              <p><strong>Address: </strong> {profile.Address}, {profile.City}, {profile.State}, {profile.ZipCode}</p>
              <button 
              onClick={() => {
                setIsEditingProfile(true);
                setUpdatedEmail(profile.email || '');
                setUpdatedAddress(profile.Address || '');
              }} className="edit-profile-btn">
                Edit Profile
              </button>
            </div>
          )}
        </div>
        {isEditingProfile && (
        <div className="modal-overlay">
          <div className="appointment-modal">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-modal-btn" onClick={() => setIsEditingProfile(false)}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                <label>Email</label>
                <input
                  type="email"
                  value={updatedEmail}
                  onChange={(e) => setUpdatedEmail(e.target.value)}
                />

                <label>Address</label>
                <input
                  type="text"
                  value={updatedAddress}
                  onChange={(e) => setUpdatedAddress(e.target.value)}
                />

                <div className="form-actions">
                  <button type="submit" className="submit-btn">Save</button>
                  <button type="button" className="cancel-btn" onClick={() => setIsEditingProfile(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                <div className="appointment-time">{formatDateTime(appt.DateTime)} </div>
                <div className="appointment-reason">{appt.Reason} - {appt.status}</div>
                <div className="clinic-info">
                  <strong>Clinic:</strong> {appt.OfficeName}
                </div>
                <div className="cancel-appt-btn-wrapper">
                  <button
                    className="cancel-appt-btn"
                    onClick={() => handleCancelAppointment(appt.AppointmentID)}
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptions */}
        <div className="dashboard-card prescriptions-section">
          <div className="card-header"><h2>Prescriptions</h2></div>
          {prescriptions.map(p => (
          <div key={p.PrescriptionID} className="prescription-item">
            <h3>{p.MedicationName}</h3>
            <p><strong>Dosage:</strong> {p.Dosage}</p>
            <p><strong>Frequency:</strong> {p.Frequency}</p>
            <p><strong>Start:</strong> {new Date(p.StartDate).toLocaleDateString()}</p>
            <p><strong>End:</strong> {new Date(p.EndDate).toLocaleDateString()}</p>
            <p><strong>Notes:</strong> {p.Notes}</p>
            <p><strong>Prescribed by:</strong> Dr. {p.DoctorFirstName} {p.DoctorLastName}</p>
          </div>
        ))}
        </div>
      </div>

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
                  <label>Referred Specialist</label>
                    <select id="specialist" onChange={handleSpecialistChange}>
                      <option value="">Use Primary Physician</option>
                      {referredSpecialists.map(s => (
                        <option key={s.DoctorID} value={s.DoctorID}>
                          Dr. {s.FirstName} {s.LastName} - {s.Specialization}
                        </option>
                      ))}
                    </select>

                    <label>Date</label>
                    <input
                      type="date"
                      id="date"
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleDateSelection(e.target.value)}
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