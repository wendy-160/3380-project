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
  const [endDate, setEndDate] = useState('2025-04-20');
  const [referralStatus, setReferralStatus] = useState('Approved');
  const [specialization, setSpecialization] = useState('');
  const [minVisits, setMinVisits] = useState('');
  const [maxVisits, setMaxVisits] = useState('');
  

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
          params: { startDate, endDate, officeId: selectedOffice || '' }
        });
      } else if (reportType === 'patient_frequency') {
        response = await axios.get(`${API}/api/reports/patient-frequency`, {
          params: {
            startDate,
            endDate,
            minVisits: minVisits || 0,
            maxVisits: maxVisits || 9999
          }
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
              <div className="filter-field">
                <label htmlFor="office">Office:</label>
                <select id="office" value={selectedOffice} onChange={(e) => setSelectedOffice(e.target.value)}>
                  <option value="">All</option>
                  {offices.map((office) => (
                    <option key={office.OfficeID} value={office.OfficeID}>
                      {office.OfficeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="filter-field">
                <label htmlFor="endDate">End Date:</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              {reportType === 'patient_frequency' && (
                <>
                  <div className="filter-field">
                    <label htmlFor="minVisits">Min Visits:</label>
                    <input
                      type="number"
                      id="minVisits"
                      min="0"
                      value={minVisits}
                      onChange={(e) => setMinVisits(e.target.value)}
                    />
                  </div>

                  <div className="filter-field">
                    <label htmlFor="maxVisits">Max Visits:</label>
                    <input
                      type="number"
                      id="maxVisits"
                      min="0"
                      value={maxVisits}
                      onChange={(e) => setMaxVisits(e.target.value)}
                    />
                  </div>
                </>
              )}
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
          <th>Appointments ($)</th>
          <th>Prescriptions ($)</th>
          <th>Tests ($)</th>
          <th>Appointment Count</th>
          <th>Avg Billing Per Appointment ($)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.OfficeName}</td>
            <td>{row.TotalRevenue ? parseFloat(row.TotalRevenue).toFixed(2) : '0.00'}</td>
<td>{row.AppointmentRevenue ? parseFloat(row.AppointmentRevenue).toFixed(2) : '0.00'}</td>
<td>{row.PrescriptionRevenue ? parseFloat(row.PrescriptionRevenue).toFixed(2) : '0.00'}</td>
<td>{row.TestRevenue ? parseFloat(row.TestRevenue).toFixed(2) : '0.00'}</td>
<td>{row.AppointmentCount || 0}</td>
<td>{row.AvgBillingPerAppointment ? parseFloat(row.AvgBillingPerAppointment).toFixed(2) : '0.00'}</td>

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
          <th>Last Visit Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.PatientName}</td>
            <td>{row.VisitCount}</td>
            <td>{new Date(row.LastVisitDate).toLocaleDateString()}</td>
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
            <td>{parseFloat(row.AvgPrescriptions).toFixed(2)}</td>
            <td>{parseFloat(row.AvgTests).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Reports;
