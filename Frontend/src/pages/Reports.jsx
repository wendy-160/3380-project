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
      if (reportType === 'doctor_performance') {
        if (!selectedDoctor) {
          alert('Please select a doctor');
          setLoading(false);
          return;
        }
        response = await axios.get(`/api/reports/doctor/${selectedDoctor}`, {
          params: { startDate, endDate }
        });
      } else if (reportType === 'clinic_utilization') {
        response = await axios.get(`${API}/api/reports/clinic-utilization`, {
          params: {
            aggregation,
            officeId: selectedOffice || '',
            startDate,
            endDate
          }
        });
      } else if (reportType === 'referral_outcomes') {
        response = await axios.get(`${API}/api/reports/referral-outcomes`, {
          params: {
            startDate,
            endDate,
            doctorId: selectedDoctor || '',
            status: referralStatus,
            specialization
          }
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
            <button
              className={reportType === 'doctor_performance' ? 'active' : ''}
              onClick={() => setReportType('doctor_performance')}
            >
              Doctor Performance Report
            </button>
            <button
              className={reportType === 'clinic_utilization' ? 'active' : ''}
              onClick={() => setReportType('clinic_utilization')}
            >
              Clinic Utilization Report
            </button>
            <button
              className={reportType === 'referral_outcomes' ? 'active' : ''}
              onClick={() => setReportType('referral_outcomes')}
            >
              Referral Outcome Report
            </button>
          </div>

          {reportType === 'doctor_performance' && (
            <div className="report-filters">
              <label>
                Select Doctor:
                <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                  <option value="">-- Select --</option>
                  {doctors.map((doc) => (
                    <option key={doc.DoctorID} value={doc.DoctorID}>
                      Dr. {doc.LastName}, {doc.FirstName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Start Date:
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label>
                End Date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <button onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}

          {reportType === 'clinic_utilization' && (
            <div className="report-filters">
              <label>
                Aggregation:
                <select value={aggregation} onChange={(e) => setAggregation(e.target.value)}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </label>
              <label>
                Select Office:
                <select value={selectedOffice} onChange={(e) => setSelectedOffice(e.target.value)}>
                  <option value="">-- All Offices --</option>
                  {offices.map((office) => (
                    <option key={office.OfficeID} value={office.OfficeID}>
                      {office.OfficeName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Start Date:
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label>
                End Date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <button onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}

          {reportType === 'referral_outcomes' && (
            <div className="report-filters">
              <label>
                Start Date:
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label>
                End Date:
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <label>
                Specialist:
                <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                  <option value="">-- All --</option>
                  {doctors.map((doc) => (
                    <option key={doc.DoctorID} value={doc.DoctorID}>
                      Dr. {doc.LastName}, {doc.FirstName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Specialization:
                <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                  <option value="">-- All --</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="OB/GYN">OB/GYN</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Heart Care">Heart Care</option>
                </select>
              </label>
              <label>
                Referral Status:
                <select value={referralStatus} onChange={(e) => setReferralStatus(e.target.value)}>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
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
              <>
                {reportType === 'doctor_performance' && (
                  <DoctorPerformanceReport data={reportData} />
                )}
                {reportType === 'clinic_utilization' && (
                  <ClinicUtilizationReport
                    data={reportData}
                    aggregation={aggregation}
                    getWeekDateRange={getWeekDateRange}
                  />
                )}
                {reportType === 'referral_outcomes' && (
                  <ReferralOutcomeReport data={reportData} />
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

// === REPORT COMPONENTS ===

const DoctorPerformanceReport = ({ data }) => {
  const completionRate = Math.round((data.CompletedAppointments / data.TotalAppointments) * 100);
  const testsPerAppointment = (data.TestsOrdered / data.CompletedAppointments).toFixed(2);
  const prescriptionsPerAppointment = (data.Prescriptions / data.CompletedAppointments).toFixed(2);
  const referralRate = Math.round((data.TotalReferrals / data.CompletedAppointments) * 100);

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

const ClinicUtilizationReport = ({ data, aggregation, getWeekDateRange }) => (
  <div className="clinic-utilization-report">
    <h2>Clinic Utilization Report ({aggregation})</h2>
    <table>
      <thead>
        <tr>
          <th>Office</th>
          <th>Date</th>
          <th>Appointment Count</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.OfficeName}</td>
            <td>
              {row.Date
                ? row.Date
                : row.Week && row.Year
                ? getWeekDateRange(row.Year, row.Week)
                : row.Year && row.Month
                ? `${row.Year}-${String(row.Month).padStart(2, '0')}`
                : 'N/A'}
            </td>
            <td>{row.AppointmentCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ReferralOutcomeReport = ({ data }) => (
  <div className="referral-outcome-report">
    <h2>Referral Outcome Report</h2>
    <table>
      <thead>
        <tr>
          <th>Referral ID</th>
          <th>Patient</th>
          <th>Specialist</th>
          <th>Status</th>
          <th>Appointment Scheduled</th>
          <th>Appointment Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td>{row.ReferralID}</td>
            <td>{row.PatientName}</td>
            <td>{row.SpecialistName}</td>
            <td>{row.ReferralStatus}</td>
            <td>{row.AppointmentScheduled}</td>
            <td>{row.AppointmentDate ? new Date(row.AppointmentDate).toLocaleString() : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Reports;