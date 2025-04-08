import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiEdit2, FiFilter, FiSearch, FiX, FiCheck, FiDownload } from 'react-icons/fi';
import './AdminBilling.css';

const AdminBilling = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  useEffect(() => {
    fetchBillings();
  }, [filters]);

  const fetchBillings = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/admin/billings';
      
      // Add query parameters for filtering
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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const updateData = {
      PaymentStatus: form.status.value,
      PaymentMethod: form.paymentMethod.value,
      PaymentDate: form.paymentDate.value,
      Notes: form.notes.value
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/billings/${selectedBill.BillingID}`, {
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

  const handleExportData = () => {
    // Create CSV content
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

    // Create and trigger download
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
        {/*
        <button className="export-btn" onClick={handleExportData}>
          <FiDownload /> Export to CSV 
        </button>*/}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
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
                    <FiEdit2 /> Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="status-form">
              <div className="bill-info">
                <p><strong>Billing ID:</strong> {selectedBill.BillingID}</p>
                <p><strong>Patient:</strong> {selectedBill.PatientName}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedBill.Amount)}</p>
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
                  <FiCheck /> Update Record
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