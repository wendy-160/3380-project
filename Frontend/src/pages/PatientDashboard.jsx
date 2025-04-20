import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';
const API = process.env.REACT_APP_API_URL;

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
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const API = process.env.REACT_APP_API_URL


  const currentPatientID = JSON.parse(localStorage.getItem('user'))?.PatientID;

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const profileRes = await fetch(`${API}/api/patients/${currentPatientID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        setProfile(profileData);

        const doctorRes = await fetch(`${API}/api/patients/${currentPatientID}/primary-physician`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (doctorRes.ok) {
          const doctorData = await doctorRes.json();
          setPrimaryPhysician(doctorData);

          const officesRes = await fetch(`${API}/api/doctors/${doctorData.DoctorID}/offices`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (officesRes.ok) {
            const officeData = await officesRes.json();
            setDoctorOffices(officeData);
          }
        }
        const referralRes = await fetch(`${API}/api/referrals/patient/${currentPatientID}/approved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (referralRes.ok) {
          const specialists = await referralRes.json();
          setReferredSpecialists(specialists);
        }        
        
        const appointmentRes = await fetch(`${API}/api/appointments/patient/${currentPatientID}/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const appointments = await appointmentRes.json();
        setUpcomingAppointments(Array.isArray(appointments) ? appointments : []);
        

        const prescriptionRes = await fetch(`${API}/api/prescriptions/patient/${currentPatientID}/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrescriptions(await prescriptionRes.json());

        const completedRes = await fetch(`${API}/api/appointments/patient/${currentPatientID}/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompletedAppointments(await completedRes.json());

          const recordsRes = await fetch(`${API}/api/medical-records/patient/${currentPatientID}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const records = await recordsRes.json();
          setMedicalRecords(Array.isArray(records) ? records : []);
        
        const testRes = await fetch(`${API}/api/tests/patient/${currentPatientID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTestResults(await testRes.json());
        
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
        fetch(`${API}/api/appointments/available/${doctorId}/${selectedDate}`),
        fetch(`${API}/api/doctors/${doctorId}/offices`, {
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
        fetch(`${API}/api/doctors/${selectedDoctorId}/offices`),
        fetch(`${API}/api/appointments/available/${selectedDoctorId}/${date}`)
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
    const selectedTime = document.getElementById("time")?.value;
    const reason = document.getElementById("reason")?.value;
    const officeId = document.getElementById("office")?.value;
  
    if (!selectedTime || !reason || !officeId) {
      return alert("Time, reason, and clinic selection are required.");
    }
  
    const token = localStorage.getItem('authToken');
    const appointmentData = {
      PatientID: currentPatientID,
      DoctorID: document.getElementById("specialist").value || primaryPhysician?.DoctorID,
      OfficeID: officeId,
      DateTime: selectedTime,
      Reason: reason,
      status: 'Scheduled'
    };
  
    try {
      const response = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unknown error");
      }
  
      setIsAppointmentModalOpen(false);
      setSelectedAppointment(null);
  
      const updatedAppointments = await fetch(`${API}/api/appointments/patient/${currentPatientID}/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
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
  
      const response = await fetch(`${API}/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }
      
      const updatedAppointments = await fetch(`${API}/api/appointments/patient/${currentPatientID}/upcoming`, {
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
      console.log("Making PUT request to:", `${API}/api/patients/${currentPatientID}`);
      const response = await fetch(`${API}/api/patients/${currentPatientID}`, {
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
          <div className="card-header"><h2>My Profile</h2></div>
          {profile && (
            <div className="profile-details">
              <p>{profile.FirstName} {profile.LastName}</p>
              <p><strong>Phone: </strong> {profile.PhoneNumber}</p>
              <p><strong>Email: </strong>{profile.email}</p>
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
                x
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
          <div className="card-header"><h2>My Primary Physician</h2></div>
          {primaryPhysician ? (
            <div>
              <h3>Dr. {primaryPhysician.FirstName} {primaryPhysician.LastName}</h3>
              <p>{primaryPhysician.Specialization}</p>
              <p><strong>Phone: </strong> {primaryPhysician.PhoneNumber}</p>
            </div>
          ) : (
            <p>Primary physician not assigned</p>
          )}
        </div>

        {/* Appointments */}
        <div className="dashboard-card appointments-section">
          <div className="card-header"><h2>Appointments</h2></div>
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

                <div className="reschedule-appt-btn-wrapper">
  <button
    className="reschedule-appt-btn"
    onClick={() => {
      setIsAppointmentModalOpen(true);
      setSelectedAppointment(appt);
      setSelectedDate(appt.DateTime.split("T")[0]);
    }}
  >
    Reschedule
  </button>
</div>

              </div>
            ))}
          </div>
        </div>

        {/* Prescriptions */}
        {completedAppointments.length > 0 && (
  <div className="dashboard-card prescriptions-section">
    <div className="card-header"><h2>Prescriptions</h2></div>
    {prescriptions.length > 0 ? prescriptions.map(p => (
      <div key={p.PrescriptionID} className="prescription-item">
        <h3>{p.MedicationName}</h3>
        <p><strong>Dosage:</strong> {p.Dosage}</p>
        <p><strong>Frequency:</strong> {p.Frequency}</p>
        <p><strong>Start:</strong> {new Date(p.StartDate).toLocaleDateString()}</p>
        <p><strong>End:</strong> {new Date(p.EndDate).toLocaleDateString()}</p>
        <p><strong>Notes:</strong> {p.Notes}</p>
        <p><strong>Prescribed by:</strong> Dr. {p.DoctorFirstName} {p.DoctorLastName}</p>
      </div>
    )) : (
      <p>No prescriptions available.</p>
    )}
  </div>
)}

        
        {/* Test Results */}
        {completedAppointments.length > 0 && (
  <div className="dashboard-card test-results-section">
    <div className="card-header"><h2>Test Results</h2></div>
    {testResults && testResults.length > 0 ? testResults.map(test => (
      <div key={test.TestID} className="test-result-item">
        <h3>{test.TestName}</h3>
        <p><strong>Ordered by:</strong> Dr. {test.DoctorFirstName} {test.DoctorLastName}</p>
        <p><strong>Status:</strong> {test.status}</p>
        <p><strong>Result:</strong> {test.results || "Pending"}</p>
        <p><strong>Notes:</strong> {test.notes}</p>
        <p><strong>Date Ordered:</strong> {new Date(test.OrderDate).toLocaleDateString()}</p>
      </div>
    )) : (
      <p>No test results yet.</p>
    )}
  </div>
)}

        {/* My Visits */}
        <div className="dashboard-card visits-section">
          <div className="card-header"><h2>My Visits</h2></div>
          {completedAppointments && completedAppointments.length > 0 ? completedAppointments.map(visit => (
            <div key={visit.AppointmentID} className="visit-item">
              <p><strong>Date:</strong> {new Date(visit.DateTime).toLocaleDateString()}</p>
              <p><strong>Doctor:</strong> Dr. {visit.DoctorFirstName} {visit.DoctorLastName}</p>
              <p><strong>Reason:</strong> {visit.Reason}</p>
              <p><strong>Status:</strong> {visit.status}</p>
            </div>
          )) : (
            <p>No completed visits yet. Book and attend an appointment to begin treatment.</p>
          )}
        </div>

        {completedAppointments.length > 0 && (
  <div className="dashboard-card medical-records-section">
    <div className="card-header"><h2>Medical Records</h2></div>
    {medicalRecords.length > 0 ? (
      medicalRecords.map(record => (
        <div key={record.RecordID} className="medical-record-item">
          <p><strong>Visit Date:</strong> {new Date(record.VisitDate).toLocaleDateString()}</p>
          <p><strong>Doctor:</strong> Dr. {record.DoctorFirstName} {record.DoctorLastName}</p>
          <p><strong>Diagnosis:</strong> {record.Diagnosis}</p>
          <p><strong>Treatment Plan:</strong> {record.TreatmentPlan}</p>
          <p><strong>Notes:</strong> {record.Notes}</p>
        </div>
      ))
    ) : (
      <p>No medical records available.</p>
    )}
  </div>
)}


        </div> {/* END of dashboard-grid */}

      {isAppointmentModalOpen && (
        <div className="modal-overlay">
          <div className="appointment-modal">
            <div className="modal-header">
              <h2>Schedule Appointment</h2>
              <button onClick={() => setIsAppointmentModalOpen(false)}>x</button>
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

                    <input
  type="date"
  id="date"
  min={new Date().toISOString().split("T")[0]}
  value={selectedDate}
  onChange={(e) => handleDateSelection(e.target.value)}
/>

                {selectedDate && (
                  <>
                    <select id="time" defaultValue={selectedAppointment?.DateTime || ""}>
  <option value="">Select a time</option>
  {availableTimeSlots.map((slot, idx) => (
    <option key={idx} value={slot}>
      {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </option>
  ))}
</select>
<label>Clinic</label>
<select id="office" defaultValue={selectedAppointment?.OfficeID || ""}>
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
