import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorDashboard.css';
const API = process.env.REACT_APP_API_URL;

const DoctorDashboard = () => {
  const doctorId = localStorage.getItem("DoctorID");
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [referralReason, setReferralReason] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [specialization, setSpecialization] = useState('');
  const [doctorProfile, setDoctorProfile] = useState(null);

  const currentDoctorID = JSON.parse(localStorage.getItem('user'))?.DoctorID;

  useEffect(() => {
    const fetchDoctorData = async () => {
      setIsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];

        const appointmentsRes = await axios.get(`${API}/api/appointments/doctor/${currentDoctorID}/date/${today}`);
        setTodaysAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);

        const doctorRes = await axios.get(`${API}/api/doctors/${currentDoctorID}`);
        setDoctorProfile(doctorRes.data);
        
        setSpecialization(doctorRes.data.Specialization);
        console.log('Doctor specialization:', doctorRes.data.Specialization);

        const referralsRes = await axios.get(`${API}/api/referrals/pending/doctor/${currentDoctorID}`);
        setPendingReferrals(Array.isArray(referralsRes.data) ? referralsRes.data : []);

        const specialistsRes = await axios.get(`${API}/api/doctors/specialists`);
        setSpecialists(Array.isArray(specialistsRes.data) ? specialistsRes.data : []);

        const patientsRes = await axios.get(`${API}/api/patients/doctor/${currentDoctorID}`);
        setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      } catch (err) {
        console.error('Error fetching doctor data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentDoctorID) fetchDoctorData();
  }, [currentDoctorID]);

  const handleCreateReferral = () => setIsReferralModalOpen(true);

  const handleSaveReferral = async () => {
    if (!selectedPatient || !selectedSpecialist || !referralReason) {
      alert('Please complete all required fields.');
      return;
    }

    if (parseInt(selectedSpecialist) === currentDoctorID) {
      alert('You cannot refer a patient to yourself.');
      return;
    }

    const referralData = {
      PatientID: parseInt(selectedPatient),
      SpecialistID: parseInt(selectedSpecialist),
      Reason: referralReason,
      Notes: referralNotes,
      ReferredBy: currentDoctorID
    };

    try {
      const response = await axios.post(`${API}/api/referrals`, referralData, {
        headers: { 'Content-Type': 'application/json' }
      });

      setIsReferralModalOpen(false);
      setSelectedPatient('');
      setSelectedSpecialist('');
      setReferralReason('');
      setReferralNotes('');

      if (response.data.updatedPendingReferrals) {
        setPendingReferrals(response.data.updatedPendingReferrals);
      }

      alert('Referral created successfully!');
    } catch (error) {
      console.error('Error creating referral:', error);
      alert('Failed to create referral.');
    }
  };

  const handleApproveReferral = async (referralID) => {
    try {
      await axios.put(`${API}/api/referrals/${referralID}/approve`);
      setPendingReferrals(prev => prev.filter(ref => ref.ReferralId !== referralID));
    } catch (err) {
      console.error('Error approving referral:', err);
    }
  };

  const handleRejectReferral = async (referralID) => {
    try {
      await axios.put(`${API}/api/referrals/${referralID}/reject`);
      setPendingReferrals(prev => prev.filter(ref => ref.ReferralId !== referralID));
    } catch (err) {
      console.error('Error rejecting referral:', err);
    }
  };

  const formatTime = (dt) =>
    new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="doctor-dashboard">
      <h1 className="dashboard-title">Doctor Dashboard</h1>
  
      {/* Doctor Profile */}
      <div className="dashboard-card doctor-profile">
        <h2>Doctor Profile</h2>
        <p><strong>Name:</strong> Dr. {doctorProfile?.FirstName} {doctorProfile?.LastName}</p>
        <p><strong>Specialization:</strong> {specialization}</p>
      </div>
  
      {/* Today's Appointments (shown to all doctors) */}
      <div className="dashboard-card appointments-section">
        <div className="card-header">
          <h2 className="card-title">Today's Appointments</h2>
        </div>
        {todaysAppointments.length > 0 ? (
          <div className="appointments-list">
            {todaysAppointments.map(appt => (
              <div key={appt.AppointmentID} className="appointment-item">
                <div className="appointment-time">
                  <span>{formatTime(appt.DateTime)}</span>
                </div>
                <div className="appointment-details">
                  <h3 className="patient-name">{appt.PatientName} {appt.PatientLastName}</h3>
                  <p className="appointment-reason">{appt.Reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="no-data">No appointments scheduled for today.</p>}
      </div>
  
      {/* Referral Creation (only for general doctors) */}
      {specialization === 'Primary Care Physician' && (
        <div className="dashboard-card create-referral-section">
          <div className="card-header">
            <h2 className="card-title">Create Referral to Specialist</h2>
          </div>
          <div className="referral-intro">
            <p>Create a new specialist referral for one of your patients.</p>
            <button className="create-referral-btn" onClick={handleCreateReferral}>
              Create New Referral
            </button>
          </div>
        </div>
      )}
  
      {/* Referral Approvals (only for specialists) */}
      {specialization !== 'Primary Care Physician' && (
        <div className="dashboard-card referrals-section">
          <div className="card-header">
            <h2 className="card-title">Pending Referral Approvals</h2>
          </div>
          {pendingReferrals.length > 0 ? (
            <div className="referrals-list">
              {pendingReferrals.map(ref => (
                <div key={ref.ReferralId} className="referral-item">
                  <div className="referral-details">
                    <h3 className="patient-name">{ref.PatientName}</h3>
                    <p className="referral-info"><span className="label">To:</span> Dr. {ref.SpecialistName} ({ref.Specialty})</p>
                    <p className="referral-reason"><span className="label">Reason:</span> {ref.Reason}</p>
                    {/*
                    <p className={`appointment-status ${appt.status?.toLowerCase()}`}>
                      Status: {appt.status || 'Scheduled'}
                    </p>*/}
                  </div>
                  <div className="referral-actions">
                    <button className="approve-btn" onClick={() => handleApproveReferral(ref.ReferralId)}>Accept</button>
                    <button className="reject-btn" onClick={() => handleRejectReferral(ref.ReferralId)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="no-data">No pending referrals to approve.</p>}
        </div>
      )}
  
      {/* Modal for Creating a Referral */}
      {isReferralModalOpen && (
        <div className="modal-overlay">
          <div className="referral-modal">
            <div className="modal-header">
              <h2>Create Specialist Referral</h2>
              <button className="close-modal-btn" onClick={() => setIsReferralModalOpen(false)}>
              </button>
            </div>
            <div className="modal-body">
              <form className="referral-form">
                <div className="form-group">
                  <label htmlFor="patient">Patient</label>
                  <select
                    id="patient"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                  >
                    <option value="">Select a patient</option>
                    {patients.map(p => (
                      <option key={p.PatientID} value={p.PatientID}>
                        {p.FirstName} {p.LastName}
                      </option>
                    ))}
                  </select>
                </div>
  
                <div className="form-group">
                  <label htmlFor="specialist">Specialist</label>
                  <select
                    id="specialist"
                    value={selectedSpecialist}
                    onChange={(e) => setSelectedSpecialist(e.target.value)}
                  >
                    <option value="">Select a specialist</option>
                    {specialists.map(s => (
                      <option key={s.DoctorID} value={s.DoctorID}>
                        Dr. {s.FirstName} {s.LastName} - {s.Specialization}
                      </option>
                    ))}
                  </select>
                </div>
  
                <div className="form-group">
                  <label htmlFor="reason">Reason for Referral</label>
                  <textarea
                    id="reason"
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    rows="4"
                  />
                </div>
  
                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    value={referralNotes}
                    onChange={(e) => setReferralNotes(e.target.value)}
                    rows="3"
                  />
                </div>
  
                <div className="form-actions">
                  <button type="button" onClick={() => setIsReferralModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" onClick={(e) => {
                    e.preventDefault();
                    handleSaveReferral();
                  }}>
                    Create Referral
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

export default DoctorDashboard;
