import React, { useState, useEffect } from 'react';
import './prescriptions.css';

const PrescriptionForm = () => {
  const [formData, setFormData] = useState({
    patientID: '',
    appointmentID: '',
    doctorID: (() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          return parsed.DoctorID?.toString() || '';
        } catch (err) {
          console.error('Error parsing localStorage user:', err);
          return '';
        }
      }
      return '';
    })(),
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
    if (formData.doctorID) {
      fetchAppointments(formData.doctorID);
    }
  }, []);

  useEffect(() => {
    const filtered = appointments.filter(
      appt => appt.PatientID.toString() === formData.patientID
    );
    setFilteredAppointments(filtered);
    if (
      formData.appointmentID &&
      !filtered.find(a => a.AppointmentID.toString() === formData.appointmentID)
    ) {
      setFormData(prev => ({ ...prev, appointmentID: '' }));
    }
  }, [formData.patientID, appointments]);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/patients');
      if (!res.ok) throw new Error('Invalid response');
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setMessage('Error loading patients');
    }
  };

  const fetchAppointments = async (doctorID) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments?doctorId=${doctorID}`);
      if (!res.ok) throw new Error('Invalid response');
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setMessage('Error loading appointments');
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date)
      ? ''
      : new Intl.DateTimeFormat('en-US', {
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

    const payload = {
      ...formData,
      doctorID: parseInt(formData.doctorID) || null
    };

    try {
      const res = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        setMessage('Prescription saved successfully!');
        setFormData(prev => ({
          ...prev,
          patientID: '',
          appointmentID: '',
          medicationName: '',
          dosage: '',
          frequency: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          notes: '',
          status: 'Active'
        }));
      } else {
        setMessage(`Error: ${result.message || 'Failed to save prescription'}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage('Error submitting prescription');
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
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientID">Patient</label>
            <select
              id="patientID"
              value={formData.patientID}
              onChange={handleChange}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.PatientID} value={p.PatientID}>
                  {p.FirstName} {p.LastName}
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
              disabled={!formData.patientID}
            >
              <option value="">Select Appointment</option>
              {filteredAppointments.map(a => (
                <option key={a.AppointmentID} value={a.AppointmentID}>
                  {formatDate(a.DateTime || a.AppointmentDate)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="medicationName">Medication Name</label>
            <input
              type="text"
              id="medicationName"
              value={formData.medicationName}
              onChange={handleChange}
              required
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={handleChange}
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
              placeholder="Optional instructions"
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
