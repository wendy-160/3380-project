import React, { useState, useEffect } from 'react';
import './prescriptions.css';

const PrescriptionForm = () => {
  const [formData, setFormData] = useState({
    patientID: '',
    appointmentID: '',
    doctorID: '1',
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    status: 'Active'
  });

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (formData.patientID) {
      const patientAppts = appointments.filter(
        appointment => appointment.PatientID.toString() === formData.patientID
      );
      setFilteredAppointments(patientAppts);
      if (formData.appointmentID && !patientAppts.find(a => a.AppointmentID.toString() === formData.appointmentID)) {
        setFormData(prev => ({ ...prev, appointmentID: '' }));
      }
    } else {
      setFilteredAppointments([]);
      setFormData(prev => ({ ...prev, appointmentID: '' }));
    }
  }, [formData.patientID, appointments]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/patients');
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setMessage('Error loading patients');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/appointments?doctorId=${formData.doctorID}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setMessage('Error loading appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Prescription saved successfully!');
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
    <div className="prescription-container">
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
              placeholder="e.g., Twice daily"
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
              min={formData.startDate}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
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
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Instructions for the patient"
            />
          </div>
        </div>

        <div className="form-row" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;
