import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiClock, FiUserPlus, FiCheck, FiX, FiChevronRight } from 'react-icons/fi';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const currentDoctorID = JSON.parse(localStorage.getItem('user'))?.DoctorID;

  useEffect(() => {
    const fetchDoctorData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const today = new Date().toISOString().split('T')[0];

        // Fetch today's appointments
        const appointmentsResponse = await axios.get(`/api/appointments/doctor/${currentDoctorID}/date/${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodaysAppointments(appointmentsResponse.data);

        // Fetch pending referrals that need approval
        const referralsResponse = await axios.get(`/api/referrals/pending/doctor/${currentDoctorID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingReferrals(referralsResponse.data);

        // Fetch specialists for referrals
        const specialistsResponse = await axios.get('/api/doctors/specialists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpecialists(specialistsResponse.data);

        // Fetch patients under this doctor
        const patientsResponse = await axios.get(`/api/patients/doctor/${currentDoctorID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(patientsResponse.data);

      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentDoctorID) fetchDoctorData();
  }, [currentDoctorID]);

  const handleCreateReferral = () => {
    setIsReferralModalOpen(true);
  };

  const handleSaveReferral = async (referralData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/referrals', referralData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Close modal and potentially refresh data
      setIsReferralModalOpen(false);
      // You could fetch updated data here if needed
      
    } catch (error) {
      console.error('Error creating referral:', error);
    }
  };

  const handleApproveReferral = async (referralID) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/referrals/${referralID}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove the approved referral from the list
      setPendingReferrals(pendingReferrals.filter(referral => referral.ReferralID !== referralID));
      
    } catch (error) {
      console.error('Error approving referral:', error);
    }
  };

  const handleRejectReferral = async (referralID) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/referrals/${referralID}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Remove the rejected referral from the list
      setPendingReferrals(pendingReferrals.filter(referral => referral.ReferralID !== referralID));
      
    } catch (error) {
      console.error('Error rejecting referral:', error);
    }
  };

  const formatTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className="doctor-dashboard">
      <h1 className="dashboard-title">Doctor Dashboard</h1>

      <div className="dashboard-grid">
        {/* Today's Appointments Section */}
        <div className="dashboard-card appointments-section">
          <div className="card-header">
            <FiCalendar className="card-icon" />
            <h2 className="card-title">Today's Appointments</h2>
          </div>
          
          {todaysAppointments.length > 0 ? (
            <div className="appointments-list">
              {todaysAppointments.map(appointment => (
                <div key={appointment.AppointmentID} className="appointment-item">
                  <div className="appointment-time">
                    <FiClock className="time-icon" />
                    <span>{formatTime(appointment.DateTime)}</span>
                  </div>
                  <div className="appointment-details">
                    <h3 className="patient-name">{appointment.PatientName}</h3>
                    <p className="appointment-reason">{appointment.Reason}</p>
                  </div>
                  <FiChevronRight className="chevron-icon" />
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No appointments scheduled for today.</p>
          )}
        </div>

        {/* Pending Referrals Section */}
        <div className="dashboard-card referrals-section">
          <div className="card-header">
            <FiUserPlus className="card-icon" />
            <h2 className="card-title">Pending Referral Approvals</h2>
          </div>
          
          {pendingReferrals.length > 0 ? (
            <div className="referrals-list">
              {pendingReferrals.map(referral => (
                <div key={referral.ReferralID} className="referral-item">
                  <div className="referral-details">
                    <h3 className="patient-name">{referral.PatientName}</h3>
                    <p className="referral-info">
                      <span className="label">To:</span> Dr. {referral.SpecialistName} ({referral.Specialty})
                    </p>
                    <p className="referral-reason">
                      <span className="label">Reason:</span> {referral.Reason}
                    </p>
                  </div>
                  <div className="referral-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleApproveReferral(referral.ReferralID)}
                    >
                      <FiCheck className="action-icon" />
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleRejectReferral(referral.ReferralID)}
                    >
                      <FiX className="action-icon" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No pending referrals to approve.</p>
          )}
        </div>
      </div>

      {/* Create Referral Section */}
      <div className="dashboard-card create-referral-section">
        <div className="card-header">
          <FiUserPlus className="card-icon" />
          <h2 className="card-title">Create Referral to Specialist</h2>
        </div>
        
        <div className="referral-intro">
          <p>Create a new specialist referral for one of your patients.</p>
          <button 
            className="create-referral-btn"
            onClick={handleCreateReferral}
          >
            Create New Referral
          </button>
        </div>
      </div>

      {/* Referral Form Modal */}
      {isReferralModalOpen && (
        <div className="modal-overlay">
          <div className="referral-modal">
            <div className="modal-header">
              <h2>Create Specialist Referral</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setIsReferralModalOpen(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <form className="referral-form">
                <div className="form-group">
                  <label htmlFor="patient">Patient</label>
                  <select id="patient" className="form-control">
                    <option value="">Select a patient</option>
                    {patients.map(patient => (
                      <option key={patient.PatientID} value={patient.PatientID}>
                        {patient.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="specialist">Specialist</label>
                  <select id="specialist" className="form-control">
                    <option value="">Select a specialist</option>
                    {specialists.map(specialist => (
                      <option key={specialist.DoctorID} value={specialist.DoctorID}>
                        Dr. {specialist.Name} - {specialist.Specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason for Referral</label>
                  <textarea 
                    id="reason" 
                    className="form-control" 
                    rows="4"
                    placeholder="Describe the reason for this referral"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea 
                    id="notes" 
                    className="form-control" 
                    rows="3"
                    placeholder="Any additional information for the specialist"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsReferralModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      // Here you would collect form data and pass to handleSaveReferral
                      handleSaveReferral({
                        // Form data would be collected here
                      });
                    }}
                  >
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