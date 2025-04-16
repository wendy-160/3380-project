import React, { useState, useEffect } from 'react';
import './MedicalRecord.css'

const MedicalRecordsPage = () => {
  // State for patient search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDOB, setSearchDOB] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // State for selected patient
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  
  // State for modals
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);

  
  // Handle patient search
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
  
    try {
      const res = await fetch(`/api/patients/search?name=${encodeURIComponent(searchTerm)}&dob=${encodeURIComponent(searchDOB)}&phone=${encodeURIComponent(searchPhone)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching patients:', err);
    }
  
    setIsSearching(false);
  };
  
  // Handle patient selection
  const selectPatient = async (patient) => {
    setSelectedPatient(patient);
  
    try {
      const res = await fetch(`/api/medical-records/patient/${patient.PatientID}`);
      const data = await res.json();
      setMedicalRecords(data);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setMedicalRecords([]);
    }
  
    setSearchResults([]);
    setSearchTerm('');
  };
  
  // Handle view record details
  const viewRecordDetails = (record) => {
    setViewingRecord(record);
  };
  
  // Handle create new medical record
  const handleCreateRecord = async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const newRecord = {
      PatientID: selectedPatient.PatientID,
      DoctorID: parseInt(formData.get('doctorId')),
      Reason: formData.get('reason'),
      Diagnosis: formData.get('diagnosis'),
      TreatmentPlan: formData.get('treatmentPlan'),
      Notes: formData.get('notes'),
    };
  
    try {
      const res = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
  
      const createdRecord = await res.json();
  
      setMedicalRecords([createdRecord, ...medicalRecords]);
      setIsNewEntryModalOpen(false);
    } catch (err) {
      console.error('Error creating new record:', err);
    }
  };
  
  return (
    <div className="medical-records-container">
      <h1>Patient Medical Records</h1>
      
      {/* Patient Search Section */}
      {!selectedPatient && (
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name..."
                className="search-input"
              />
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Phone Number"
                className="search-input"
              />
              <input
                type="date"
                value={searchDOB}
                onChange={(e) => setSearchDOB(e.target.value)}
                placeholder="Date of Birth"
                className="search-input"
              />
              
            </div>
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
          
          {isSearching && <p>Searching...</p>}
          
          {searchResults.length > 0 && (
            <div className="search-results">
              <h2>Search Results</h2>
              <div className="patient-cards">
                {searchResults.map(patient => (
                  <div key={patient.PatientID} className="patient-card" onClick={() => selectPatient(patient)}>
                    <div className="patient-info">
                      <h3>{patient.FirstName} {patient.LastName}</h3>
                      <p>ID: {patient.PatientID}</p>
                      <p>DOB: {new Date(patient.DateOfBirth).toLocaleDateString()}</p>
                      <p>Gender: {patient.Gender}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
      
      {/* Patient Records Section */}
      {selectedPatient && (
        <div className="patient-records-section">
          <div className="patient-header">
            <div className="patient-info-header">
              <h2>{selectedPatient.FirstName} {selectedPatient.LastName}</h2>
              <p>Patient ID: {selectedPatient.PatientID} | DOB: {new Date(selectedPatient.DateOfBirth).toLocaleDateString()} | Gender: {selectedPatient.Gender}</p>
            </div>
            <div className="header-actions">
              <button className="action-button new-entry-btn" onClick={() => setIsNewEntryModalOpen(true)}>
                New Entry
              </button>
              <button className="action-button back-btn" onClick={() => setSelectedPatient(null)}>
                Back to Search
              </button>
            </div>
          </div>
          
          <div className="medical-records-list">
            <h3>Medical History</h3>
            {medicalRecords.length === 0 ? (
              <div className="no-records">
                <p>No medical records found for this patient.</p>
                <button className="action-button new-entry-btn" onClick={() => setIsNewEntryModalOpen(true)}>
                  Create First Record
                </button>
              </div>
            ) : (
              <div className="records-timeline">
                {medicalRecords.map(record => (
                  <div key={record.AppointmentID} className="record-card" onClick={() => viewRecordDetails(record)}>
                    <div className="record-date">
                      <span>{new Date(record.DateTime).toLocaleDateString()}</span>
                    </div>
                    <div className="record-summary">
                      <h4>{record.Reason}</h4>
                      <p><strong>Diagnosis:</strong> {record.Diagnosis}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* New Entry Modal */}
      {isNewEntryModalOpen && (
        <div className="modal-overlay">
          <div className="record-modal">
            <div className="modal-header">
              <h2>Create New Medical Record</h2>
            </div>
            <form onSubmit={handleCreateRecord} className="record-form">
              <div className="form-group">
                <label htmlFor="doctorId">Attending Doctor</label>
                <select
                  id="doctorId"
                  name="doctorId"
                  required
                  className="form-control"
                >
                  <option value="">Select a doctor</option>
                  <option value="5">Dr. Sarah Johnson</option>
                  <option value="8">Dr. Michael Chen</option>
                  <option value="12">Dr. Emily Rodriguez</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="reason">Reason for Visit</label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  required
                  className="form-control"
                  placeholder="Chief complaint or reason"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="diagnosis">Diagnosis</label>
                <input
                  type="text"
                  id="diagnosis"
                  name="diagnosis"
                  required
                  className="form-control"
                  placeholder="Primary diagnosis"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="treatmentPlan">Treatment Plan</label>
                <textarea
                  id="treatmentPlan"
                  name="treatmentPlan"
                  required
                  className="form-control"
                  rows="3"
                  placeholder="Medications, procedures, recommendations..."
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Clinical Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  rows="5"
                  placeholder="Observations, test results, follow-up plans..."
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsNewEntryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Record Modal */}
      {viewingRecord && (
        <div className="modal-overlay">
          <div className="record-modal">
            <div className="modal-header">
              <h2>Medical Record Details</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setViewingRecord(null)}
              >
              </button>
            </div>
            <div className="record-details">
              <div className="detail-group">
                <h3>Visit Information</h3>
                <p><strong>Date:</strong> {new Date(viewingRecord.DateTime).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(viewingRecord.DateTime).toLocaleTimeString()}</p>
                <p><strong>Appointment ID:</strong> {viewingRecord.AppointmentID}</p>
                <p><strong>Doctor ID:</strong> {viewingRecord.DoctorID}</p>
                <p><strong>Reason for Visit:</strong> {viewingRecord.Reason}</p>
              </div>
              
              <div className="detail-group">
                <h3>Diagnosis & Treatment</h3>
                <p><strong>Diagnosis:</strong> {viewingRecord.Diagnosis}</p>
                <div className="treatment-plan">
                  <h4>Treatment Plan:</h4>
                  <p>{viewingRecord.TreatmentPlan}</p>
                </div>
              </div>
              
              <div className="detail-group">
                <h3>Clinical Notes</h3>
                <p>{viewingRecord.Notes}</p>
              </div>
              
              <div className="detail-group">
                <h3>Metadata</h3>
                <p><strong>Created:</strong> {new Date(viewingRecord.created_at).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> {new Date(viewingRecord.updated_at).toLocaleString()}</p>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="close-btn"
                  onClick={() => setViewingRecord(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;