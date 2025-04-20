import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Reports.css';
const API = process.env.REACT_APP_API_URL;

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);

  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [aggregation, setAggregation] = useState('Monthly');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [referralStatus, setReferralStatus] = useState('Approved');
  const [specialization, setSpecialization] = useState('');

  const isAdmin = user?.Role === 'Admin';

  useEffect(() => {
    if (isAdmin) {
      loadDoctors();
      loadOffices();
    }
  }, [isAdmin]);

  const loadDoctors = async () => {
    try {
      const response = await axios.get(`${API}/api/doctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadOffices = async () => {
    try {
      const response = await axios.get(`${API}/api/offices`);
      setOffices(response.data);
    } catch (error) {
      console.error('Error loading offices:', error);
    }
  };

  const generateReport = async () => {
    if (!reportType) return;
    setLoading(true);
    setReportData(null);

    try {
      let response;
      if (reportType === 'clinic_profitability') {
        response = await axios.get(`${API}/api/reports/clinic-profitability`, {
          params: { startDate, endDate }
        });
      } else if (reportType === 'patient_frequency') {
        response = await axios.get(`${API}/api/reports/patient-frequency`, {
          params: { startDate, endDate }
        });
      } else if (reportType === 'doctor_efficiency') {
        response = await axios.get(`${API}/api/reports/doctor-efficiency`, {
          params: { startDate, endDate }
        });
      }
      

      setReportData(response.data);
    } catch (err) {
      console.error('Error generating report:', err);
    }

    setLoading(false);
  };

  function getWeekDateRange(year, week) {
    const start = new Date(year, 0, 1 + (week - 1) * 7);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(start.setDate(diff));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  }

  return (
    <div className="reports-page">
      <h1>Medical Clinic Reports</h1>

      {!isAdmin ? (
        <p>Access denied. Admin privileges required.</p>
      ) : (
        <>
          <div className="report-selection">
  <button className={reportType === 'clinic_profitability' ? 'active' : ''} onClick={() => setReportType('clinic_profitability')}>
    Clinic Profitability Report
  </button>
  <button className={reportType === 'patient_frequency' ? 'active' : ''} onClick={() => setReportType('patient_frequency')}>
    Patient Visit Frequency
  </button>
  <button className={reportType === 'doctor_efficiency' ? 'active' : ''} onClick={() => setReportType('doctor_efficiency')}>
    Doctor Efficiency Report
  </button>
</div>

{['clinic_profitability', 'patient_frequency', 'doctor_efficiency'].includes(reportType) && (
  <div className="report-filters">
  <label>
    Start Date:
    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
  </label>
  <label>
    End Date:
    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
  </label>
  <div className="button-cell">
    <button onClick={generateReport} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Report'}
    </button>
  </div>
</div>

)}


          <div className="report-results">
            {loading ? (
              <p>Loading report...</p>
            ) : reportData ? (
              <>
                {reportType === 'clinic_profitability' && (
  <ClinicProfitabilityReport data={reportData} />
)}
{reportType === 'patient_frequency' && (
  <PatientFrequencyReport data={reportData} />
)}
{reportType === 'doctor_efficiency' && (
  <DoctorEfficiencyReport data={reportData} />
)}

              </>
            ) : (
              reportType 
            )}
          </div>
        </>
      )}
    </div>
  );
};

const ClinicProfitabilityReport = ({ data }) => (
  <div className="clinic-profitability-report">
    <h2>Clinic Profitability Report</h2>
    <table>
      <thead>
        <tr>
          <th>Office</th>
          <th>Total Revenue ($)</th>
          <th>Appointment Count</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.OfficeName}</td>
            <td>{row.TotalRevenue.toFixed(2)}</td>
            <td>{row.AppointmentCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PatientFrequencyReport = ({ data }) => (
  <div className="patient-frequency-report">
    <h2>Patient Visit Frequency</h2>
    <table>
      <thead>
        <tr>
          <th>Patient</th>
          <th>Visit Count</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.PatientName}</td>
            <td>{row.VisitCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DoctorEfficiencyReport = ({ data }) => (
  <div className="doctor-efficiency-report">
    <h2>Doctor Efficiency Report</h2>
    <table>
      <thead>
        <tr>
          <th>Doctor</th>
          <th>Appointments</th>
          <th>Avg Prescriptions</th>
          <th>Avg Tests</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.DoctorName}</td>
            <td>{row.TotalAppointments}</td>
            <td>{row.AvgPrescriptions.toFixed(2)}</td>
            <td>{row.AvgTests.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


export default Reports;