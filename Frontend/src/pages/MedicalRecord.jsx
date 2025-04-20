import React, { useState } from 'react';
import './MedicalRecord.css';
const API = process.env.REACT_APP_API_URL;

const MedicalRecordsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDOB, setSearchDOB] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [newRecord, setNewRecord] = useState({
    doctorId: '',
    reason: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
  });

  const handleSearch = async (e = null) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setSearchResults([]);
  
    try {
      const res = await fetch(
        `${API}/api/patients/search?name=${encodeURIComponent(searchTerm)}&dob=${encodeURIComponent(searchDOB)}&phone=${encodeURIComponent(searchPhone)}`,
        {
          credentials: 'include',
        }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching patients:', err);
    }
  
    setIsSearching(false);
  };
  

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const patient = searchResults[0];

    const payload = {
      patientId: patient.PatientID,
      doctorId: parseInt(newRecord.doctorId),
      visitDate: new Date().toISOString().split('T')[0],
      diagnosis: newRecord.diagnosis,
      treatmentPlan: newRecord.treatmentPlan,
      notes: newRecord.notes,
    };

    try {
      const res = await fetch(`${API}/api/medical-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        await handleSearch(); 
        setNewRecord({ doctorId: '', reason: '', diagnosis: '', treatmentPlan: '', notes: '' });
        setShowForm(false);
        setSuccessMessage('Record successfully created.');
        setTimeout(() => setSuccessMessage(''), 3000);

      } else {
        console.error('Error creating record:', result);
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  return (
    <div className="medical-records-container">
      <h1>Patient Medical Records</h1>

      {successMessage && (
  <div className="success-message" style={{ color: 'green', marginTop: '1rem' }}>
    {successMessage}
  </div>
)}

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Patient Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          value={searchDOB}
          onChange={(e) => setSearchDOB(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isSearching && <p>Searching...</p>}

      {searchResults.length > 0 && (
        <div className="results-section">
          <h2>Results</h2>

          <div className="patient-info">
            <strong>
              {searchResults[0].FirstName} {searchResults[0].LastName}
            </strong>{' '}
            (DOB: {new Date(searchResults[0].DOB).toLocaleDateString()})<br />
            Phone: {searchResults[0].PhoneNumber}
          </div>

          <button className="new-record-btn" onClick={() => setShowForm(true)} style={{ margin: '1rem 0' }}>
            + New Medical Record
          </button>

          <div className="record-list">
            {searchResults.map((r, idx) => (
              <div key={idx} className="record-card">
                <p><strong>Visit Date:</strong> {new Date(r.VisitDate).toLocaleDateString()}</p>
                <p><strong>Diagnosis:</strong> {r.Diagnosis}</p>
                <p><strong>Treatment:</strong> {r.TreatmentPlan}</p>
                <p><strong>Notes:</strong> {r.Notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && !isSearching && (
        <p style={{ marginTop: '1rem' }}>No records found.</p>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-add-record">
            <h3>New Medical Record</h3>
            <form onSubmit={handleCreateSubmit}>
              <label>
                Doctor ID
                <input
                  type="number"
                  value={newRecord.doctorId}
                  onChange={(e) => setNewRecord({ ...newRecord, doctorId: e.target.value })}
                  required
                />
              </label>
              <label>
                Reason for Visit
                <input
                  type="text"
                  value={newRecord.reason}
                  onChange={(e) => setNewRecord({ ...newRecord, reason: e.target.value })}
                  required
                />
              </label>
              <label>
                Diagnosis
                <input
                  type="text"
                  value={newRecord.diagnosis}
                  onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                  required
                />
              </label>
              <label>
                Treatment Plan
                <textarea
                  value={newRecord.treatmentPlan}
                  onChange={(e) => setNewRecord({ ...newRecord, treatmentPlan: e.target.value })}
                  required
                />
              </label>
              <label>
                Notes
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                />
              </label>

              <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;
