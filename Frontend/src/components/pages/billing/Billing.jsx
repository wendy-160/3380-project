import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Billing = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [billingRecords, setBillingRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const isAdmin = user?.role === 'Admin';
  
  useEffect(() => {
    // If user is a patient, load their billing
    if (user && user.role === 'Patient') {
      loadPatientBilling(user.id);
    } 
    // If user is admin, load list of patients
    else if (isAdmin) {
      loadPatients();
    }
  }, [user]);
  
  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/billing/patients');
      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setLoading(false);
    }
  };
  
  const loadPatientBilling = async (patientId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/billing/patient/${patientId}`);
      setBillingRecords(response.data);
      setSelectedPatient(patientId);
      setLoading(false);
    } catch (error) {
      console.error('Error loading billing:', error);
      setLoading(false);
    }
  };
  
  const updatePaymentStatus = async (billId, status) => {
    try {
      await axios.put(`/api/billing/${billId}/status`, { status });
      // Refresh the billing records
      loadPatientBilling(selectedPatient);
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };
  
  const generateInvoice = async (billId) => {
    try {
      // This would typically generate a PDF or redirect to a printable page
      window.open(`/api/billing/${billId}/invoice`, '_blank');
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };
  
  return (
    <div className="billing-page">
      <h1>Patient Billing</h1>
      
      {isAdmin && !selectedPatient && (
        <div className="patient-list">
          <h2>Select a Patient</h2>
          {loading ? (
            <p>Loading patients...</p>
          ) : (
            <ul>
              {patients.map(patient => (
                <li key={patient.PatientID}>
                  <button onClick={() => loadPatientBilling(patient.PatientID)}>
                    {patient.FirstName} {patient.LastName} (MRN: {patient.MRN})
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {selectedPatient && (
        <div className="billing-records">
          {isAdmin && (
            <button onClick={() => setSelectedPatient(null)}>Back to Patient List</button>
          )}
          
          <h2>Billing Records</h2>
          
          {loading ? (
            <p>Loading billing records...</p>
          ) : billingRecords.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Insurance</th>
                  <th>Date</th>
                  <th>Appointment</th>
                  <th>Doctor</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {billingRecords.map(bill => (
                  <tr key={bill.BillID}>
                    <td>{bill.BillID}</td>
                    <td>${bill.Amount}</td>
                    <td>{bill.PaymentStatus}</td>
                    <td>{bill.InsuranceProvider}</td>
                    <td>{new Date(bill.BillingDate).toLocaleDateString()}</td>
                    <td>
                      {new Date(bill.AppointmentDate).toLocaleString()} - {bill.AppointmentReason}
                    </td>
                    <td>Dr. {bill.DoctorFirstName} {bill.DoctorLastName}</td>
                    {isAdmin && (
                      <td>
                        <select 
                          value={bill.PaymentStatus}
                          onChange={(e) => updatePaymentStatus(bill.BillID, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Canceled">Canceled</option>
                        </select>
                        <button onClick={() => generateInvoice(bill.BillID)}>
                          Generate Invoice
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No billing records found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Billing; 