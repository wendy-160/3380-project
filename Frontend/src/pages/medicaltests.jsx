import React, { useState, useEffect } from 'react';
import './medicaltests.css'
const API = process.env.REACT_APP_API_URL;

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
  const [testName, setTestName] = useState('');
const [selectedOfficeId, setSelectedOfficeId] = useState('');
const [selectedDate, setSelectedDate] = useState('');
const [testNotes, setTestNotes] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const doctorId = localStorage.getItem('DoctorID');
        const appointmentsRes = await fetch(`${API}/api/appointments?doctorId=${doctorId}`);
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
        
        const testsRes = await fetch(`${API}/api/tests`);
        const testsData = await testsRes.json();
  
        if (Array.isArray(testsData) && testsData.length > 0) {
          const patientMap = new Map();
          const testsWithPatients = await Promise.all(testsData.map(async (test) => {
            if (patientMap.has(test.PatientID)) {
              return {
                ...test,
                PatientName: patientMap.get(test.PatientID)
              };
            }
  
            try {
              const patientRes = await fetch(`${API}/api/patients/${test.PatientID}`);
              const patientData = await patientRes.json();
              const patientName = patientData ? `${patientData.FirstName} ${patientData.LastName}` : 'Unknown Patient';
              patientMap.set(test.PatientID, patientName);
              return { ...test, PatientName: patientName };
            } catch (err) {
              console.error(`Error fetching patient ${test.PatientID}:`, err);
              return { ...test, PatientName: 'Unknown Patient' };
            }
          }));
  
          setTests(testsWithPatients);
        } else {
          setTests(testsData);
        }
  
        const patientsRes = await fetch(`${API}/api/patients`);
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
  
        const officesRes = await fetch(`${API}/api/offices`);
        const officesData = await officesRes.json();
        setOffices(officesData);
  
      } catch (error) {
        console.error("Error fetching tests or supporting data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);


  const fetchTests = () => {
    setLoading(true);
    fetch(`${API}/api/tests`)
      .then(res => res.json())
      .then(data => {
        setTests(data);
        setLoading(false);
      });
  };

  const handleOrderTest = async (e) => {
    e.preventDefault();
    const doctorId = localStorage.getItem("DoctorID");
  
    try {
      const response = await fetch(`${API}/api/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          doctor_id: doctorId,
          office_id: selectedOfficeId,
          test_name: testName,
          test_type: testType,
          test_date: selectedDate,
          notes: testNotes
        })
      });
  
      if (!response.ok) {
        const err = await response.json();
        console.error("Failed to order test:", err.message);
        alert(err.message);
        return;
      }
  
      setIsOrderModalOpen(false);
      setTestType('');
      setTestName('');
      setSelectedOfficeId('');
      setSelectedDate('');
      setTestNotes('');
      setPatientId('');
      fetchTests();
    } catch (err) {
      console.error("Network error ordering test:", err);
      alert("Network error");
    }
  };  

  const handleUpdateResults = async (e) => {
    e.preventDefault();
    if (!selectedTest?.TestID) return;

    await fetch(`${API}/api/tests/${selectedTest.TestID}`, {
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
                {(test.status === 'Scheduled' || test.status === 'Completed' || test.status === 'Results Available' || test.status === 'Ordered') && (
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
    <select required value={patientId} onChange={(e) => setPatientId(e.target.value)}>
      <option value="">Select a patient</option>
      {patients.map(p => (
        <option key={p.PatientID} value={p.PatientID}>
          {p.FirstName} {p.LastName}
        </option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label>Office</label>
    <select required value={selectedOfficeId} onChange={(e) => setSelectedOfficeId(e.target.value)}>
      <option value="">Select a clinic</option>
      {offices.map(o => (
        <option key={o.OfficeID} value={o.OfficeID}>
          {o.OfficeName} - {o.Address}
        </option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label>Test Name</label>
    <input type="text" required value={testName} onChange={(e) => setTestName(e.target.value)} />
  </div>

  <div className="form-group">
    <label>Test Type</label>
    <input type="text" required value={testType} onChange={(e) => setTestType(e.target.value)} />
  </div>

  <div className="form-group">
    <label>Date</label>
    <input type="date" required value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
  </div>

  <div className="form-group">
    <label>Notes</label>
    <textarea value={testNotes} onChange={(e) => setTestNotes(e.target.value)} rows="3" />
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
