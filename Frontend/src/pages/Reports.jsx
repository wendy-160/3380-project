import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);

  const isAdmin = user?.Role === 'Admin';

  useEffect(() => {
    if (!isAdmin) return;
    loadDoctors();
  }, [isAdmin]);

  const loadDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const generateReport = async () => {
    if (!reportType) return;

    setLoading(true);
    setReportData(null);

    try {
      let response;

      if (reportType === 'doctor_performance') {
        if (!selectedDoctor) {
          alert('Please select a doctor');
          setLoading(false);
          return;
        }
        response = await axios.get(`http://localhost:5000/api/reports/doctor/${selectedDoctor}`);
        setReportData(response.data);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    }

    setLoading(false);
  };

  return (
    <div className="reports-page">
      <h1>Medical Clinic Reports</h1>

      {!isAdmin ? (
        <p>Access denied. Admin privileges required.</p>
      ) : (
        <>
          <div className="report-selection">
            <button
              className={reportType === 'doctor_performance' ? 'active' : ''}
              onClick={() => setReportType('doctor_performance')}
            >
              Doctor Performance Report
            </button>
          </div>

          {reportType === 'doctor_performance' && (
            <div className="report-filters">
              <label>
                Select Doctor:
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {doctors.map((doc) => (
                    <option key={doc.DoctorID} value={doc.DoctorID}>
                      Dr. {doc.LastName}, {doc.FirstName}
                    </option>
                  ))}
                </select>
              </label>

              <button onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}

          <div className="report-results">
            {loading ? (
              <p>Loading report...</p>
            ) : reportData ? (
              <DoctorPerformanceReport data={reportData} />
            ) : (
              reportType && <p>Select filters and click "Generate Report".</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const DoctorPerformanceReport = ({ data }) => {
  return (
    <div className="doctor-performance-report">
      <h2>Doctor Performance Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Doctor ID</th>
            <th>Total Appointments</th>
            <th>Completed Appointments</th>
            <th>Total Referrals</th>
            <th>Prescriptions Written</th>
            <th>Tests Ordered</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.doctorId}</td>
            <td>{data.TotalAppointments}</td>
            <td>{data.CompletedAppointments}</td>
            <td>{data.TotalReferrals}</td>
            <td>{data.Prescriptions}</td>
            <td>{data.TestsOrdered}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
