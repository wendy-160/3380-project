import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  const [startDate, setStartDate] = useState(new Date().getFullYear() + '-01-01');
  const [endDate, setEndDate] = useState(new Date().getFullYear() + '-12-31');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  

  const isAdmin = user?.role === 'Admin';
  
  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    

    loadPatientsAndDoctors();
  }, [isAdmin]);
  
  const loadPatientsAndDoctors = async () => {
    try {
      const [patientsResponse, doctorsResponse] = await Promise.all([
        axios.get('/api/patients'),
        axios.get('/api/doctors')
      ]);
      setPatients(patientsResponse.data);
      setDoctors(doctorsResponse.data);
    } catch (error) {
      console.error('Error loading selection data:', error);
    }
  };
  
  const generateReport = async () => {
    if (!reportType) return;
    
    setLoading(true);
    try {
      let response;
      
      switch (reportType) {
        case 'appointments':
          response = await axios.get('/api/reports/appointments', {
            params: { startDate, endDate }
          });
          break;
          
        case 'patient_record':
          if (!selectedPatient) {
            alert('Please select a patient');
            setLoading(false);
            return;
          }
          response = await axios.get(`/api/reports/patient/${selectedPatient}`);
          break;
          
        case 'doctor_workload':
          if (selectedDoctor) {
            response = await axios.get(`/api/reports/doctor/${selectedDoctor}/schedule`, {
              params: { startDate, endDate }
            });
          } else {
            response = await axios.get('/api/reports/doctors/workload');
          }
          break;
      }
      
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
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
              className={reportType === 'appointments' ? 'active' : ''} 
              onClick={() => setReportType('appointments')}
            >
              Appointments Report
            </button>
            <button 
              className={reportType === 'patient_record' ? 'active' : ''} 
              onClick={() => setReportType('patient_record')}
            >
              Patient Medical Record
            </button>
            <button 
              className={reportType === 'doctor_workload' ? 'active' : ''} 
              onClick={() => setReportType('doctor_workload')}
            >
              Doctor Workload Report
            </button>
          </div>
          
          {reportType && (
            <div className="report-filters">
              {['appointments', 'doctor_workload'].includes(reportType) && (
                <>
                  <label>
                    Start Date:
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                    />
                  </label>
                  <label>
                    End Date:
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                    />
                  </label>
                </>
              )}
              
              {reportType === 'patient_record' && (
                <label>
                  Select Patient:
                  <select 
                    value={selectedPatient} 
                    onChange={e => setSelectedPatient(e.target.value)}
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(patient => (
                      <option key={patient.PatientID} value={patient.PatientID}>
                        {patient.LastName}, {patient.FirstName} (MRN: {patient.MRN})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              
              {reportType === 'doctor_workload' && (
                <label>
                  Select Doctor (optional):
                  <select 
                    value={selectedDoctor} 
                    onChange={e => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">-- All Doctors --</option>
                    {doctors.map(doctor => (
                      <option key={doctor.DoctorID} value={doctor.DoctorID}>
                        Dr. {doctor.LastName}, {doctor.FirstName}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              
              <button onClick={generateReport} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          )}
          
          <div className="report-results">
            {loading ? (
              <p>Loading report data...</p>
            ) : reportData ? (
              <>
                {reportType === 'appointments' && (
                  <AppointmentsReportTable data={reportData} />
                )}
                
                {reportType === 'patient_record' && (
                  <PatientRecordReport data={reportData} />
                )}
                
                {reportType === 'doctor_workload' && (
                  <DoctorWorkloadReport 
                    data={reportData} 
                    selectedDoctor={selectedDoctor} 
                  />
                )}
              </>
            ) : (
              reportType && <p>Select filters and generate the report</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const AppointmentsReportTable = ({ data }) => (
  <div>
    <h2>Monthly Appointments by Clinic</h2>
    {data.length === 0 ? (
      <p>No appointments found in the selected date range.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Office</th>
            <th>Year</th>
            <th>Month</th>
            <th>Appointment Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.OfficeName}</td>
              <td>{row.Year}</td>
              <td>{new Date(row.Year, row.Month - 1).toLocaleString('default', { month: 'long' })}</td>
              <td>{row.AppointmentCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const PatientRecordReport = ({ data }) => (
  <div>
    <h2>Medical Record for: {data.patient.FirstName} {data.patient.LastName}</h2>
    <p>MRN: {data.patient.MRN}</p>
    <p>DOB: {new Date(data.patient.DOB).toLocaleDateString()}</p>
    
    <h3>Medical Visits</h3>
    {data.medicalRecords.length === 0 ? (
      <p>No medical records found.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Doctor</th>
            <th>Diagnosis</th>
            <th>Treatment</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {data.medicalRecords.map(record => (
            <tr key={record.MedicalRecordID}>
              <td>{new Date(record.VisitDate).toLocaleDateString()}</td>
              <td>Dr. {record.DoctorFirstName} {record.DoctorLastName}</td>
              <td>{record.Diagnosis}</td>
              <td>{record.Treatment}</td>
              <td>{record.Notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    
    <h3>Prescriptions</h3>
    {data.prescriptions.length === 0 ? (
      <p>No prescriptions found.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Medication</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Prescribed By</th>
          </tr>
        </thead>
        <tbody>
          {data.prescriptions.map(prescription => (
            <tr key={prescription.PrescriptionID}>
              <td>{new Date(prescription.DatePrescribed).toLocaleDateString()}</td>
              <td>{prescription.MedicationName}</td>
              <td>{prescription.Dosage}</td>
              <td>{prescription.Frequency}</td>
              <td>{prescription.Duration}</td>
              <td>Dr. {prescription.DoctorFirstName} {prescription.DoctorLastName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    
    <h3>Test Orders</h3>
    {data.tests.length === 0 ? (
      <p>No test orders found.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Ordered By</th>
          </tr>
        </thead>
        <tbody>
          {data.tests.map(test => (
            <tr key={test.OrderID}>
              <td>{test.OrderID}</td>
              <td>{new Date(test.OrderDate).toLocaleDateString()}</td>
              <td>{test.Status}</td>
              <td>Dr. {test.DoctorFirstName} {test.DoctorLastName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const DoctorWorkloadReport = ({ data, selectedDoctor }) => {
  if (!selectedDoctor) {
    return (
      <div>
        <h2>Doctor Workload Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialization</th>
              <th>Patient Count</th>
              <th>View Details</th>
            </tr>
          </thead>
          <tbody>
            {data.map(doctor => (
              <tr key={doctor.DoctorID}>
                <td>Dr. {doctor.FirstName} {doctor.LastName}</td>
                <td>{doctor.Specialization}</td>
                <td>{doctor.PatientCount}</td>
                <td>
                  <a href={`?report=doctor_workload&doctor_id=${doctor.DoctorID}`}>
                    View Schedule
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Schedule for Dr. {data.doctor.FirstName} {data.doctor.LastName}</h2>
      
      <h3>Office Assignments</h3>
      {data.offices.length === 0 ? (
        <p>No office assignments found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Office</th>
              <th>Address</th>
              <th>Work Days</th>
            </tr>
          </thead>
          <tbody>
            {data.offices.map((office, index) => (
              <tr key={index}>
                <td>{office.OfficeName}</td>
                <td>{office.OfficeAddress}</td>
                <td>{office.WorkDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <h3>Monthly Appointment Counts</h3>
      {data.appointments.length === 0 ? (
        <p>No appointments found in the selected date range.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th>Month</th>
              <th>Appointment Count</th>
            </tr>
          </thead>
          <tbody>
            {data.appointments.map((item, index) => (
              <tr key={index}>
                <td>{item.Year}</td>
                <td>{new Date(item.Year, item.Month - 1).toLocaleString('default', { month: 'long' })}</td>
                <td>{item.AppointmentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Reports; 