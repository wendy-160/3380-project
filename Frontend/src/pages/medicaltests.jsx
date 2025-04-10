import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiEdit2, FiFileText, FiCheck } from 'react-icons/fi';
import './MedicalTests.css';

const MedicalTests = () => {
  const [tests, setTests] = useState([]);
  const [testType, setTestType] = useState("");
  const [patientId, setPatientId] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/tests")
      .then((res) => res.json())
      .then((data) => {
        setTests(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
        setLoading(false);
      });
  }, []);

  const orderTest = () => {
    fetch("http://localhost:5000/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test_type: testType, patient_id: patientId }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Test ordered successfully!");
        setTestType("");
        setPatientId("");
      })
      .catch((error) => console.error("Error ordering test:", error));
  };

  const handleOrderTest = (e) => {
    e.preventDefault();
    orderTest();
    setIsOrderModalOpen(false);
  };

  const handleUpdateResults = (e) => {
    e.preventDefault();
    alert("Results updated! (functionality not fully implemented yet)");
    setIsUpdateModalOpen(false);
  };

  const handlePatientSelect = (id) => {
    setPatientId(id);
  };

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
          <FiPlus /> Order New Test
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
                  <span className={`status-badge ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                </div>

                <div className="test-details">
                  <p className="patient-name">Patient: {test.PatientName}</p>
                  <p className="test-type">Type: {test.TestType}</p>
                  <p className="test-date">Test Date: {formatDate(test.TestDate)}</p>
                  {test.ResultDate && <p className="result-date">Result Date: {formatDate(test.ResultDate)}</p>}
                  {test.Results && (
                    <div className="results-section">
                      <h4>Results</h4>
                      <p>{test.Results}</p>
                    </div>
                  )}
                  {test.Notes && (
                    <div className="notes-section">
                      <h4>Notes</h4>
                      <p>{test.Notes}</p>
                    </div>
                  )}
                </div>

                {(test.status === 'Scheduled' || test.status === 'Completed') && (
                  <button
                    className="update-results-btn"
                    onClick={() => {
                      setSelectedTest(test);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    <FiEdit2 /> Update Results
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Order Test Modal */}
      {isOrderModalOpen && (
        <div className="modal-overlay">
          <div className="test-modal">
            <div className="modal-header">
              <h2>Order New Test</h2>
              <button className="close-modal-btn" onClick={() => setIsOrderModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleOrderTest} className="test-form">
              <div className="form-group">
                <label htmlFor="patient">Patient</label>
                <select id="patient" name="patient" required className="form-control" onChange={(e) => handlePatientSelect(e.target.value)}>
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.PatientID} value={patient.PatientID}>
                      {patient.FirstName} {patient.LastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="appointment">Associated Appointment</label>
                <select id="appointment" name="appointment" className="form-control">
                  <option value="">Select an appointment</option>
                  {appointments.map(appointment => (
                    <option key={appointment.AppointmentID} value={appointment.AppointmentID}>
                      {formatDate(appointment.DateTime)} - {appointment.Reason}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="office">Office Location</label>
                <select id="office" name="office" required className="form-control">
                  <option value="">Select an office</option>
                  {offices.map(office => (
                    <option key={office.OfficeID} value={office.OfficeID}>
                      {office.OfficeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="testName">Test Name</label>
                <input type="text" id="testName" name="testName" required className="form-control" placeholder="Enter test name" />
              </div>

              <div className="form-group">
                <label htmlFor="testType">Test Type</label>
                <input type="text" id="testType" name="testType" required className="form-control" placeholder="Enter test type" />
              </div>

              <div className="form-group">
                <label htmlFor="testDate">Test Date</label>
                <input type="date" id="testDate" name="testDate" required className="form-control" min={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" className="form-control" rows="3" placeholder="Enter any additional notes"></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsOrderModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <FiFileText /> Order Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Results Modal */}
      {isUpdateModalOpen && selectedTest && (
        <div className="modal-overlay">
          <div className="test-modal">
            <div className="modal-header">
              <h2>Update Test Results</h2>
              <button className="close-modal-btn" onClick={() => { setIsUpdateModalOpen(false); setSelectedTest(null); }}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdateResults} className="test-form">
              <div className="test-info">
                <p><strong>Test:</strong> {selectedTest.TestName}</p>
                <p><strong>Type:</strong> {selectedTest.TestType}</p>
                <p><strong>Patient:</strong> {selectedTest.PatientName}</p>
                <p><strong>Test Date:</strong> {formatDate(selectedTest.TestDate)}</p>
              </div>

              <div className="form-group">
                <label htmlFor="results">Test Results</label>
                <textarea id="results" name="results" className="form-control" rows="4" placeholder="Enter test results" required></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea id="notes" name="notes" className="form-control" rows="3" placeholder="Enter any additional notes"></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => { setIsUpdateModalOpen(false); setSelectedTest(null); }}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <FiCheck /> Update Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalTests;
