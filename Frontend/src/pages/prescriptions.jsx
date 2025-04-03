import React, { useState, useEffect } from 'react';
import './prescriptions.css';

const PrescriptionForm = () => {
  // State for form data
  const [formData, setFormData] = useState({
    patientID: '',
    appointmentID: '',
    doctorID: '1', // Assuming logged in doctor's ID
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date as default
    endDate: '',
    notes: '',
    status: 'Active'
  });

  // State for patients and appointments data
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch patients and appointments on component mount
  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  // Filter appointments when patient changes
  useEffect(() => {
    if (formData.patientID) {
      const patientAppts = appointments.filter(
        appointment => appointment.PatientID.toString() === formData.patientID
      );
      setFilteredAppointments(patientAppts);
      
      // Clear selected appointment if not valid for this patient
      if (formData.appointmentID && !patientAppts.find(a => a.AppointmentID.toString() === formData.appointmentID)) {
        setFormData(prev => ({ ...prev, appointmentID: '' }));
      }
    } else {
      setFilteredAppointments([]);
      setFormData(prev => ({ ...prev, appointmentID: '' }));
    }
  }, [formData.patientID, appointments]);

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch patients');
      
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setMessage('Failed to load patients data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const doctorId = formData.doctorID;
      const response = await fetch(`/api/appointments?doctorId=${doctorId}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setMessage('Failed to load appointments data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage('Prescription saved successfully!');
        // Reset form fields except doctor ID
        setFormData({
          patientID: '',
          appointmentID: '',
          doctorID: formData.doctorID,
          medicationName: '',
          dosage: '',
          frequency: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          notes: '',
          status: 'Active'
        });
      } else {
        setMessage(`Error: ${result.message || 'Failed to save prescription'}`);
      }
    } catch (error) {
      setMessage('Error submitting form. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>New Prescription</h1>
      
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}
      
      <div className="patient-info">
        <div className="patient-header">
          <h3>Patient Information</h3>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientID">Patient</label>
            <select 
              id="patientID" 
              value={formData.patientID} 
              onChange={handleChange} 
              required
              disabled={isLoading}
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.PatientID} value={patient.PatientID}>
                  {patient.FullName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="appointmentID">Appointment</label>
            <select 
              id="appointmentID" 
              value={formData.appointmentID} 
              onChange={handleChange}
              disabled={!formData.patientID || isLoading}
            >
              <option value="">Select Appointment</option>
              {filteredAppointments.map(appointment => (
                <option key={appointment.AppointmentID} value={appointment.AppointmentID}>
                  {formatDate(appointment.AppointmentDate)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <form id="prescriptionForm" onSubmit={handleSubmit}>
        <input type="hidden" id="doctorID" value={formData.doctorID} />
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="medicationName">Medication Name</label>
            <input 
              type="text" 
              id="medicationName" 
              value={formData.medicationName}
              onChange={handleChange}
              required 
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dosage">Dosage</label>
            <input 
              type="text" 
              id="dosage" 
              value={formData.dosage}
              onChange={handleChange}
              required 
              placeholder="e.g., 10mg" 
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="frequency">Frequency</label>
            <input 
              type="text" 
              id="frequency" 
              value={formData.frequency}
              onChange={handleChange}
              required 
              placeholder="e.g., Twice daily with meals" 
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input 
              type="date" 
              id="startDate" 
              value={formData.startDate}
              onChange={handleChange}
              required 
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input 
              type="date" 
              id="endDate" 
              value={formData.endDate}
              onChange={handleChange}
              disabled={isLoading}
              min={formData.startDate} // Ensure end date is after start date
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Prescription Status</label>
            <select 
              id="status" 
              value={formData.status}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="notes">Notes & Instructions</label>
            <textarea 
              id="notes" 
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any special instructions or notes for the patient"
              disabled={isLoading}
            ></textarea>
          </div>
        </div>
        
        <div className="form-row" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()} disabled={isLoading}>Cancel</button>
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;