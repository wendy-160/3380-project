// MedicalRecordPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MedicalRecordPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: patientId,
    appointmentId: '',
    doctorId: '',
    visitDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatmentPlan: '',
    notes: ''
  });
  
  // Patient selection state
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [appointmentDateSearch, setAppointmentDateSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showPatientSearch, setShowPatientSearch] = useState(!patientId);
  const [recentPatients, setRecentPatients] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Get doctor ID from logged in user - this would come from your auth system
  const currentDoctorId = localStorage.getItem('doctorId') || '';
  
  useEffect(() => {
    // If no patientId is provided, show the patient search instead of loading data
    if (!patientId) {
      setLoading(false);
      setShowPatientSearch(true);
      fetchRecentPatients();
      return;
    }
    
    // Fetch patient info, medical records, and doctors list on component mount
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient information 
        const patientResponse = await fetch(`/api/patients/${patientId}`);
        if (!patientResponse.ok) {
          throw new Error('Failed to fetch patient data');
        }
        const patientData = await patientResponse.json();
        setPatient(patientData);
        
        // Fetch medical records for this patient
        const recordsResponse = await fetch(`/api/medical-records/patient/${patientId}`);
        if (!recordsResponse.ok) {
          throw new Error('Failed to fetch medical records');
        }
        const recordsData = await recordsResponse.json();
        setMedicalRecords(recordsData);
        
        // Fetch doctors list
        const doctorsResponse = await fetch('/api/doctors');
        if (!doctorsResponse.ok) {
          throw new Error('Failed to fetch doctors list');
        }
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData);
        
        // Fetch upcoming appointments for this patient to populate dropdown
        const appointmentsResponse = await fetch(`/api/appointments/patient/${patientId}/upcoming`);
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          if (appointmentsData.length > 0) {
            // Pre-fill the form with the first upcoming appointment
            setFormData(prev => ({
              ...prev,
              appointmentId: appointmentsData[0].AppointmentID,
              doctorId: currentDoctorId || appointmentsData[0].DoctorID
            }));
          }
        }
        
        // Add this patient to recent patients in localStorage
        addToRecentPatients(patientData);
        
        setLoading(false);
        setShowPatientSearch(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, currentDoctorId]);

  const fetchRecentPatients = async () => {
    try {
      setSearchLoading(true);
      
      // First try to get from localStorage
      const storedRecent = localStorage.getItem('recentPatients');
      if (storedRecent) {
        const parsedRecent = JSON.parse(storedRecent);
        setRecentPatients(parsedRecent);
      } else {
        // If not in localStorage, fetch from API
        const response = await fetch(`/api/patients/doctor/${currentDoctorId}/recent`);
        if (response.ok) {
          const data = await response.json();
          setRecentPatients(data);
        }
      }
      
      setSearchLoading(false);
    } catch (err) {
      console.error('Error fetching recent patients:', err);
      setSearchLoading(false);
    }
  };

  const addToRecentPatients = (patient) => {
    // Skip if no patient
    if (!patient) return;
    
    try {
      // Get existing recent patients
      const storedRecent = localStorage.getItem('recentPatients');
      let recentPatientsList = storedRecent ? JSON.parse(storedRecent) : [];
      
      // Remove this patient if already exists
      recentPatientsList = recentPatientsList.filter(
        p => p.PatientID !== patient.PatientID
      );
      
      // Add to beginning of array
      recentPatientsList.unshift(patient);
      
      // Keep only the last 5
      recentPatientsList = recentPatientsList.slice(0, 5);
      
      // Save back to localStorage
      localStorage.setItem('recentPatients', JSON.stringify(recentPatientsList));
      
      // Update state
      setRecentPatients(recentPatientsList);
    } catch (err) {
      console.error('Error updating recent patients:', err);
    }
  };

  const handlePatientSearch = async () => {
    if (!patientSearchTerm.trim() && !appointmentDateSearch.trim()) {
      // Require at least one search parameter
      return;
    }
    
    try {
      setSearchLoading(true);
      
      // Build the search query with parameters
      let searchQuery = '/api/medical-records/search?';
      const params = [];
      
      if (patientSearchTerm.trim()) {
        params.push(`name=${encodeURIComponent(patientSearchTerm.trim())}`);
      }
      
      if (appointmentDateSearch.trim()) {
        params.push(`date=${encodeURIComponent(appointmentDateSearch.trim())}`);
      }
      
      searchQuery += params.join('&');
      
      const response = await fetch(searchQuery);
      
      if (!response.ok) {
        throw new Error('Failed to search medical records');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setSearchLoading(false);
    } catch (err) {
      console.error('Error searching medical records:', err);
      setSearchLoading(false);
    }
  };

  const handlePatientSelect = (selectedPatientId) => {
    navigate(`/medical-records/patient/${selectedPatientId}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePatientSearch();
    }
  };

  const handleShowPatientSearch = () => {
    setShowPatientSearch(true);
    fetchRecentPatients();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add medical record');
      }
      
      const newRecord = await response.json();
      
      // Update the UI with the new record
      setMedicalRecords([...medicalRecords, newRecord]);
      
      // Reset form and hide it
      setFormData({
        patientId: patientId,
        appointmentId: '',
        doctorId: currentDoctorId,
        visitDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatmentPlan: '',
        notes: ''
      });
      setShowAddForm(false);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const navigateToPrescriptions = () => {
    navigate(`/prescriptions/patient/${patientId}`);
  };

  const navigateToTests = () => {
    navigate(`/medical-tests/patient/${patientId}`);
  };

  const handlePrintRecord = (recordId) => {
    // Open the print view in a new tab/window
    window.open(`/medical-records/print/${recordId}`, '_blank');
  };

  const handleEditRecord = (recordId) => {
    // Navigate to the edit record page
    navigate(`/medical-records/edit/${recordId}`);
  };

  if (loading) return <div className="loading">Loading patient records...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Show patient search if requested or if no patient is selected
  if (showPatientSearch) {
    return (
      <div className="medical-record-page">
        <div className="patient-search-container">
          <h1>Medical Records Search</h1>
          <p>Search for medical records by patient name and/or appointment date</p>
          
          <div className="search-form">
            <div className="search-field">
              <label htmlFor="patientName">Patient Name:</label>
              <input
                type="text"
                id="patientName"
                placeholder="Enter patient name"
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="search-field">
              <label htmlFor="appointmentDate">Appointment Date:</label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDateSearch}
                onChange={(e) => setAppointmentDateSearch(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button onClick={handlePatientSearch} className="search-button">
              Search Records
            </button>
          </div>
          
          {searchLoading && <div className="loading">Searching records...</div>}
          
          {searchResults.length > 0 && (
            <div className="search-results">
              <h2>Search Results</h2>
              <div className="records-list">
                {searchResults.map(record => (
                  <div 
                    key={record.MedicalRecordID} 
                    className="record-card"
                    onClick={() => handlePatientSelect(record.PatientID)}
                  >
                    <div className="record-header">
                      <h3>Patient: {record.PatientFirstName} {record.PatientLastName}</h3>
                      <p><strong>Visit Date:</strong> {new Date(record.VisitDate).toLocaleDateString()}</p>
                      <p><strong>Doctor:</strong> Dr. {record.DoctorFirstName} {record.DoctorLastName}</p>
                    </div>
                    <div className="record-body">
                      <div className="record-section">
                        <h4>Diagnosis</h4>
                        <p>{record.Diagnosis}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {searchResults.length === 0 && patientSearchTerm.trim() && (
            <div className="no-results">
              <p>No medical records found matching your search criteria.</p>
            </div>
          )}
          
          {recentPatients.length > 0 && (
            <div className="recent-patients">
              <h2>Recent Patients</h2>
              <div className="patient-list">
                {recentPatients.map(patient => (
                  <div 
                    key={patient.PatientID} 
                    className="patient-item"
                    onClick={() => handlePatientSelect(patient.PatientID)}
                  >
                    <div className="patient-name">
                      {patient.FirstName} {patient.LastName}
                    </div>
                    <div className="patient-details">
                      <p>DOB: {new Date(patient.DateOfBirth).toLocaleDateString()}</p>
                      <p>ID: {patient.PatientID}</p>
                      <p>Phone: {patient.PhoneNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show medical records for selected patient
  if (!patient) return <div className="error">Patient not found</div>;

  return (
    <div className="medical-record-page">
      <div className="patient-header">
        <div className="header-top">
          <h1>Medical Records: {patient.FirstName} {patient.LastName}</h1>
          <button onClick={handleShowPatientSearch} className="change-patient-btn">
            Change Patient
          </button>
        </div>
        <div className="patient-info">
          <p><strong>DOB:</strong> {new Date(patient.DateOfBirth).toLocaleDateString()}</p>
          <p><strong>Gender:</strong> {patient.Gender}</p>
          <p><strong>Phone:</strong> {patient.PhoneNumber}</p>
          <p><strong>Email:</strong> {patient.Email}</p>
        </div>
        <div className="action-buttons">
          <button onClick={navigateToPrescriptions}>View Prescriptions</button>
          <button onClick={navigateToTests}>View Medical Tests</button>
          <button 
            className="add-record-btn" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Record'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-record-form">
          <h2>Add New Medical Record</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="appointmentId">Appointment:</label>
              <select 
                id="appointmentId" 
                name="appointmentId" 
                value={formData.appointmentId} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select Appointment</option>
                {/* Appointment options would be populated from API */}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="doctorId">Doctor:</label>
              <select 
                id="doctorId" 
                name="doctorId" 
                value={formData.doctorId} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.DoctorID} value={doctor.DoctorID}>
                    Dr. {doctor.FirstName} {doctor.LastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="visitDate">Visit Date:</label>
              <input 
                type="date" 
                id="visitDate" 
                name="visitDate" 
                value={formData.visitDate} 
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="diagnosis">Diagnosis:</label>
              <textarea 
                id="diagnosis" 
                name="diagnosis" 
                value={formData.diagnosis} 
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="treatmentPlan">Treatment Plan:</label>
              <textarea 
                id="treatmentPlan" 
                name="treatmentPlan" 
                value={formData.treatmentPlan} 
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes:</label>
              <textarea 
                id="notes" 
                name="notes" 
                value={formData.notes} 
                onChange={handleInputChange}
                rows="4"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="submit-btn">Save Record</button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="records-container">
        <h2>Patient Medical History</h2>
        {medicalRecords.length === 0 ? (
          <p className="no-records">No medical records found for this patient.</p>
        ) : (
          <div className="records-list">
            {medicalRecords.map(record => (
              <div key={record.MedicalRecordID} className="record-card">
                <div className="record-header">
                  <h3>Visit: {new Date(record.VisitDate).toLocaleDateString()}</h3>
                  <p>
                    <strong>Doctor:</strong> Dr. {record.DoctorFirstName} {record.DoctorLastName}
                  </p>
                </div>
                <div className="record-body">
                  <div className="record-section">
                    <h4>Diagnosis</h4>
                    <p>{record.Diagnosis}</p>
                  </div>
                  <div className="record-section">
                    <h4>Treatment Plan</h4>
                    <p>{record.TreatmentPlan}</p>
                  </div>
                  <div className="record-section">
                    <h4>Notes</h4>
                    <p>{record.Notes || 'No additional notes'}</p>
                  </div>
                </div>
                <div className="record-footer">
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEditRecord(record.MedicalRecordID)}
                  >
                    Edit
                  </button>
                  <button 
                    className="print-btn" 
                    onClick={() => handlePrintRecord(record.MedicalRecordID)}
                  >
                    Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordPage;