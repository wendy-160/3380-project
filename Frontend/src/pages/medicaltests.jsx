import React, { useState, useEffect } from 'react';
import './medicaltests.css'

const MedicalTests = () => {
  const [tests, setTests] = useState([]);
  const [testType, setTestType] = useState('');
  const [patientId, setPatientId] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [offices, setOffices] = useState([]);
  const [updateForm, setUpdateForm] = useState({ results: '', notes: '' });

  useEffect(() => {

    // Get the current doctor's ID from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const doctorID = currentUser.DoctorID;

    // First, fetch all tests
    fetch("http://localhost:5000/api/tests")
      .then((res) => res.json())
      .then(async (data) => {
        // If we have tests, fetch patient details for each test
        if (Array.isArray(data) && data.length > 0) {
          // Create a map to store patient information
          const patientMap = new Map();
          
          // Process each test to add patient information
          const testsWithPatients = await Promise.all(data.map(async (test) => {
            // If we already have this patient's info, use it from our map
            if (patientMap.has(test.PatientID)) {
              return {
                ...test,
                PatientName: patientMap.get(test.PatientID)
              };
            }
            
            // Otherwise, fetch the patient information
            try {
              const patientRes = await fetch(`http://localhost:5000/api/patients/${test.PatientID}`);
              const patientData = await patientRes.json();
              
              // Create a full name from patient data
              const patientName = patientData ? `${patientData.FirstName} ${patientData.LastName}` : 'Unknown Patient';
              
              // Store in our map for future use
              patientMap.set(test.PatientID, patientName);
              
              // Return the test with patient name
              return {
                ...test,
                PatientName: patientName
              };
            } catch (err) {
              console.error(`Error fetching patient ${test.PatientID}:`, err);
              return {
                ...test,
                PatientName: 'Unknown Patient'
              };
            }
          }));
          
          setTests(testsWithPatients);
        } else {
          setTests(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
        setLoading(false);
      });
    fetchTests();
    fetch('http://localhost:5000/api/patients')
      .then(res => res.json())
      .then(setPatients);
    fetch('http://localhost:5000/api/appointments')
      .then(res => res.json())
      .then(setAppointments);
    fetch('http://localhost:5000/api/offices')
      .then(res => res.json())
      .then(setOffices);
  }, []);

  const fetchTests = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/tests')
      .then(res => res.json())
      .then(data => {
        setTests(data);
        setLoading(false);
      });
  };

  const orderTest = async () => {
    await fetch('http://localhost:5000/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_type: testType, patient_id: patientId })
      });
        setTestType('');
        setPatientId('');
        setIsOrderModalOpen(false);
        fetchTests();
  };

  const handleOrderTest = (e) => {
    e.preventDefault();
    orderTest();
  };

  const handleUpdateResults = async (e) => {
    e.preventDefault();
    if (!selectedTest?.TestID) return;

    await fetch(`http://localhost:5000/api/tests/${selectedTest.TestID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateForm)
    });

    setIsUpdateModalOpen(false);
    setSelectedTest(null);
    setUpdateForm({ results: '', notes: '' });
    fetchTests();
  };

  const handlePatientSelect = (id) => setPatientId(id);
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'Scheduled': return 'blue';
      case 'Canceled': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="medical-tests-page">
      <div className="page-header">
        <h1>Medical Tests</h1>
        <button className="order-test-btn" onClick={() => setIsOrderModalOpen(true)}>
          + Order New Test
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="tests-grid">
          {tests.length === 0 ? (
            <div className="no-tests">No medical tests found.</div>
          ) : (
            tests.map(test => (
              <div key={test.TestID} className={`test-card ${getStatusColor(test.status)}`}>
                <div className="test-header">
                  <h3>{test.TestName}</h3>
                  <span className={`status-badge ${getStatusColor(test.status)}`}>{test.status}</span>
                </div>
                <div className="test-details">
                  <p>Patient: {test.PatientName || test.PatientID}</p>
                  <p>Type: {test.TestType}</p>
                  <p>Test Date: {formatDate(test.TestDate)}</p>
                  {test.ResultDate && <p>Result Date: {formatDate(test.ResultDate)}</p>}
                  {test.Results && <p><strong>Results:</strong> {test.Results}</p>}
                  {test.Notes && <p><strong>Notes:</strong> {test.Notes}</p>}
                </div>
                {(test.status === 'Scheduled' || test.status === 'Completed' || test.status === 'Results Available') && (
                  <button
                    className="update-results-btn"
                    onClick={() => {
                  setSelectedTest(test);
                  setUpdateForm({ results: test.Results || '', notes: test.Notes || '' });
                  setIsUpdateModalOpen(true);
                    }}
                  >
                  Update Results
                </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {isOrderModalOpen && (
        <div className="modal-overlay">
          <div className="test-modal">
            <div className="modal-header">
              <h2>Order New Test</h2>
              <button className="close-modal-btn" onClick={() => setIsOrderModalOpen(false)}>x</button>
            </div>
            <form onSubmit={handleOrderTest} className="test-form">
              <div className="form-group">
                <label>Patient</label>
                <select required onChange={(e) => handlePatientSelect(e.target.value)}>
                  <option value="">Select a patient</option>
                  {patients.map(p => <option key={p.PatientID} value={p.PatientID}>{p.FirstName} {p.LastName}</option>)}
              </select>
              </div>
              <div className="form-group">
                <label>Test Type</label>
                <input type="text" required value={testType} onChange={(e) => setTestType(e.target.value)} />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">Order Test</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdateModalOpen && selectedTest && (
        <div className="modal-overlay">
          <div className="test-modal">
            <div className="modal-header">
              <h2>Update Test Results</h2>
              <button className="close-modal-btn" onClick={() => { setIsUpdateModalOpen(false); setSelectedTest(null); }}>x</button>
            </div>
            <form onSubmit={handleUpdateResults} className="test-form">
              <div className="test-info">
                <p><strong>Test:</strong> {selectedTest.TestName}</p>
                <p><strong>Type:</strong> {selectedTest.TestType}</p>
              </div>
              <div className="form-group">
                <label>Results</label>
              <textarea
                value={updateForm.results}
                onChange={(e) => setUpdateForm({ ...updateForm, results: e.target.value })}
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
              <textarea
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn"> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalTests;
