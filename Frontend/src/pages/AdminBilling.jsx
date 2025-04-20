import React, { useState, useEffect } from 'react';
import './AdminBilling.css';
const API = process.env.REACT_APP_API_URL;

const AdminBilling = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [tests, setTests] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  useEffect(() => {
    fetchBillings();
    fetchPatients();
    fetchAppointments();
    fetchPrescriptions();
    fetchTests();
  }, [filters]);

  const fetchBillings = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API}/api/admin/billings`;
      
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.searchTerm) queryParams.append('search', filters.searchTerm);
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setBillings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching billings:', error);
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/admin/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/admin/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/admin/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/admin/tests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const updateData = {
      PaymentStatus: form.status.value,
      PaymentMethod: form.paymentMethod.value,
      PaymentDate: form.paymentDate.value,
      Notes: form.notes.value,
      Amount: parseFloat(form.amount.value)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/admin/billings/${selectedBill.BillingID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setIsUpdateModalOpen(false);
        setSelectedBill(null);
        fetchBillings();
      }
    } catch (error) {
      console.error('Error updating billing:', error);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const billData = {
      PatientID: form.patientId.value,
      AppointmentID: form.appointmentId.value || null,
      PrescriptionID: form.prescriptionId.value || null,
      TestID: form.testId.value || null,
      Amount: parseFloat(form.amount.value),
      PaymentStatus: form.status.value,
      BillingDate: form.billingDate.value,
      PaymentMethod: form.paymentMethod.value || null,
      PaymentDate: form.paymentDate.value || null,
      Notes: form.notes.value || null
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/admin/billings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(billData)
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        fetchBillings();
      }
    } catch (error) {
      console.error('Error creating billing:', error);
    }
  };

  const handleExportData = () => {
    const headers = ['Billing ID', 'Patient Name', 'Service Type', 'Amount', 'Status', 'Billing Date', 'Payment Date'];
    const csvContent = [
      headers.join(','),
      ...billings.map(bill => [
        bill.BillingID,
        bill.PatientName,
        bill.ServiceType,
        bill.Amount,
        bill.PaymentStatus,
        new Date(bill.BillingDate).toLocaleDateString(),
        bill.PaymentDate ? new Date(bill.PaymentDate).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_records_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-billing-page">
      <div className="page-header">
        <h1>Billing Management</h1>
        <div className="header-actions">
          <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}>
            Create New Bill
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by patient name or ID..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Insurance Pending">Insurance Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Billing Records Table */}
      <div className="billing-records">
        <table className="billing-table">
          <thead>
            <tr>
              <th>Billing ID</th>
              <th>Patient Name</th>
              <th>Service Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Billing Date</th>
              <th>Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billings.map(bill => (
              <tr key={bill.BillingID}>
                <td>{bill.BillingID}</td>
                <td>{bill.PatientName}</td>
                <td>{bill.ServiceType}</td>
                <td className="amount-cell">{formatCurrency(bill.Amount)}</td>
                <td>
                  <span className={`status-badge ${bill.PaymentStatus.toLowerCase().replace(' ', '-')}`}>
                    {bill.PaymentStatus}
                  </span>
                </td>
                <td>{formatDate(bill.BillingDate)}</td>
                <td>{bill.PaymentDate ? formatDate(bill.PaymentDate) : '-'}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setSelectedBill(bill);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Bill Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="create-modal">
            <div className="modal-header">
              <h2>Create New Bill</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setIsCreateModalOpen(false)}
              >
              
              </button>
            </div>
            <form onSubmit={handleCreateBill} className="create-form">
              <div className="form-group">
                <label htmlFor="patientId">Patient</label>
                <select
                  id="patientId"
                  name="patientId"
                  required
                  className="form-control"
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.PatientID} value={patient.PatientID}>
                      {patient.FirstName} {patient.LastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="appointmentId">Related Appointment (Optional)</label>
                <select
                  id="appointmentId"
                  name="appointmentId"
                  className="form-control"
                >
                  <option value="">None</option>
                  {appointments.map(appointment => (
                    <option key={appointment.AppointmentID} value={appointment.AppointmentID}>
                      ID: {appointment.AppointmentID} - Date: {new Date(appointment.AppointmentDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prescriptionId">Related Prescription (Optional)</label>
                <select
                  id="prescriptionId"
                  name="prescriptionId"
                  className="form-control"
                >
                  <option value="">None</option>
                  {prescriptions.map(prescription => (
                    <option key={prescription.PrescriptionID} value={prescription.PrescriptionID}>
                      ID: {prescription.PrescriptionID} - Medicine: {prescription.MedicineName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="testId">Related Test (Optional)</label>
                <select
                  id="testId"
                  name="testId"
                  className="form-control"
                >
                  <option value="">None</option>
                  {tests.map(test => (
                    <option key={test.TestID} value={test.TestID}>
                      ID: {test.TestID} - Test: {test.TestName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  min="0"
                  required
                  className="form-control"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Payment Status</label>
                <select
                  id="status"
                  name="status"
                  required
                  className="form-control"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Insurance Pending">Insurance Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="billingDate">Billing Date</label>
                <input
                  type="date"
                  id="billingDate"
                  name="billingDate"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method (Optional)</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="form-control"
                >
                  <option value="">Select payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date (Optional)</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  rows="3"
                  placeholder="Add any additional notes..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                   Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isUpdateModalOpen && selectedBill && (
        <div className="modal-overlay">
          <div className="status-modal">
            <div className="modal-header">
              <h2>Update Billing Status</h2>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setSelectedBill(null);
                }}
              >
              
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="status-form">
              <div className="bill-info">
                <p><strong>Billing ID:</strong> {selectedBill.BillingID}</p>
                <p><strong>Patient:</strong> {selectedBill.PatientName}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedBill.Amount)}</p>
              </div>

              <div className="form-group">
  <label htmlFor="amount">Amount ($)</label>
  <input
    type="number"
    id="amount"
    name="amount"
    step="0.01"
    min="0"
    required
    defaultValue={selectedBill.Amount}
    className="form-control"
  />
</div>


              <div className="form-group">
                <label htmlFor="status">Payment Status</label>
                <select
                  id="status"
                  name="status"
                  defaultValue={selectedBill.PaymentStatus}
                  required
                  className="form-control"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Insurance Pending">Insurance Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  defaultValue={selectedBill.PaymentMethod || ''}
                  className="form-control"
                >
                  <option value="">Select payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  defaultValue={selectedBill.PaymentDate?.split('T')[0] || ''}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  defaultValue={selectedBill.Notes || ''}
                  className="form-control"
                  rows="3"
                  placeholder="Add any additional notes..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedBill(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                   Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBilling;
