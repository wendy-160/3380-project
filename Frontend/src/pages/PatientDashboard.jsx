import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import ModalForm from '../../components/ModalForm';
import axios from 'axios';
import { FiPlus} from 'react-icons/fi';
import './PatientDashboard.css'

const PatientDashboard = () => {
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [primaryCarePhysician, setPrimaryCarePhysician] = useState(null);
    const [patientProfile, setPatientProfile] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentPatientID = JSON.parse(localStorage.getItem('user'))?.PatientID;
    const { user } = useAuth();
  
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
  
          // Fetch patient profile
          const profileResponse = await axios.get(`/api/patient/${currentPatientID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPatientProfile(profileResponse.data);
  
          // Fetch assigned primary care physician
          const doctorResponse = await axios.get(`/api/patient/${currentPatientID}/primary-doctor`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPrimaryCarePhysician(doctorResponse.data);
  
          // Fetch all patient appointments
          const appointmentsResponse = await axios.get(`/api/appointments/patient/${currentPatientID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPatientAppointments(appointmentsResponse.data);
  
          // Fetch prescriptions
          const prescriptionsResponse = await axios.get(`/api/prescriptions/patient/${currentPatientID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPrescriptions(prescriptionsResponse.data);
  
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      if (currentPatientID) fetchData();
    }, [currentPatientID]);
  
    const handleRequestAppointment = () => {
      setIsModalOpen(true);
    };
  
    const handleCancelAppointment = async (appointmentID) => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/appointments/${appointmentID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Remove canceled appointment from the state
        setPatientAppointments(patientAppointments.filter(appointment => appointment.AppointmentID !== appointmentID));
      } catch (error) {
        console.error('Error canceling appointment:', error);
      }
    };
  
    const handleSaveAppointment = (formData) => {
      console.log('Saved Appointment:', formData);
      setIsModalOpen(false);
    };
  
  
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Patient Dashboard</h1>
        
        <div className="dashboard-grid">
          {/* Profile Card */}
          <div className="dashboard-card profile-card">
            <h2 className="card-title">My Profile</h2>
            <div className="profile-info">
              <p><span className="label">Name:</span> {patientProfile.name}</p>
              <p><span className="label">Email:</span> {patientProfile.email}</p>
              <p><span className="label">Phone:</span> {patientProfile.phone}</p>
            </div>
          </div>
  
          {/* Primary Care Physician Card */}
          <div className="dashboard-card pcp-card">
            <h2 className="card-title">Primary Care Physician</h2>
            {primaryCarePhysician ? (
              <div className="pcp-info">
                <p className="doctor-name">Dr. {primaryCarePhysician.name}</p>
                <p className="doctor-specialty">{primaryCarePhysician.specialty}</p>
              </div>
            ) : (
              <p className="no-data">No assigned primary care physician.</p>
            )}
          </div>
        </div>
  
        {/* Appointments Section */}
        <div className="dashboard-card appointment-section">
          <div className="section-header">
            <h2 className="card-title">Appointments</h2>
            <button 
              onClick={handleRequestAppointment}
              className="new-appointment-btn"
            >
              <FiPlus className="icon" /> New Appointment
            </button>
          </div>
          
          <div className="appointments-container">
            {patientAppointments.length > 0 ? (
              <div className="appointments-grid">
                {patientAppointments.map(appointment => (
                  <div 
                    key={appointment.AppointmentID} 
                    className={`appointment-card ${appointment.Status.toLowerCase()}`}
                  >
                    <p><span className="label">Date:</span> {new Date(appointment.DateTime).toLocaleDateString()}</p>
                    <p><span className="label">Time:</span> {new Date(appointment.DateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p><span className="label">Reason:</span> {appointment.Reason}</p>
                    <p><span className={`status-badge ${appointment.Status.toLowerCase()}`}>{appointment.Status}</span></p>
                    {appointment.Status === 'Scheduled' && (
                      <button 
                        onClick={() => handleCancelAppointment(appointment.AppointmentID)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No appointments found.</p>
            )}
          </div>
          <ModalForm 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveAppointment}
            />
        </div>
  
        {/* Prescriptions Section */}
        <div className="dashboard-card prescription-section">
          <h2 className="card-title">Prescriptions</h2>
          
          {prescriptions.length > 0 ? (
            <ul className="prescription-list">
              {prescriptions.map((prescription) => (
                <li key={prescription.PrescriptionID} className="prescription-item">
                  <div className="prescription-details">
                    <p className="medication-name">{prescription.MedicationName}</p>
                    <p className="medication-dosage">{prescription.Dosage}</p>
                  </div>
                  {prescription.RefillsRemaining && (
                    <span className="refills-badge">
                      Refills: {prescription.RefillsRemaining}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No prescriptions available.</p>
          )}
        </div>
  
        
      </div>
    );
  };
  
  export default PatientDashboard;