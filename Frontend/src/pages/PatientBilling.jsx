import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCreditCard, FiClock, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import './PatientBilling.css';

const PatientBilling = () => {
  const [bills, setBills] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const currentPatientID = JSON.parse(localStorage.getItem('user'))?.PatientID;

  useEffect(() => {
    if (currentPatientID) {
      fetchBillings();
    }
  }, [currentPatientID]);

  const fetchBillings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/billings/patient/${currentPatientID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setBills(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching billings:', error);
      setLoading(false);
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    
    const paymentData = {
      BillingID: selectedBill.BillingID,
      Amount: parseFloat(paymentAmount),
      PaymentMethod: paymentMethod,
      PaymentDate: new Date().toISOString(),
      PaymentStatus: selectedBill.Amount === parseFloat(paymentAmount) ? 'Paid' : 'Partially Paid'
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/billings/${selectedBill.BillingID}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setIsPaymentModalOpen(false);
        setSelectedBill(null);
        setPaymentAmount('');
        setPaymentMethod('');
        fetchBillings();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
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

  const getBillSource = (bill) => {
    if (bill.AppointmentID) return "Appointment";
    if (bill.PrescriptionID) return "Prescription";
    if (bill.TestID) return "Medical Test";
    return "Other Services";
  };

  return (
    <div className="billing-page">
      <h1 className="page-title">Billing & Payments</h1>

      {/* Outstanding Bills Section */}
      <div className="billing-section">
        <h2 className="section-title">
          <FiAlertCircle className="section-icon" />
          Outstanding Bills
        </h2>
        <div className="bills-grid">
          {bills
            .filter(bill => ['Pending', 'Partially Paid', 'Insurance Pending', 'Overdue'].includes(bill.PaymentStatus))
            .map(bill => (
              <div key={bill.BillingID} className={`bill-card ${bill.PaymentStatus.toLowerCase().replace(' ', '-')}`}>
                <div className="bill-header">
                  <div>
                    <h3>{getBillSource(bill)}</h3>
                    <span className="bill-type">{bill.Description || 'Medical Service'}</span>
                  </div>
                  <span className={`status-badge ${bill.PaymentStatus.toLowerCase().replace(' ', '-')}`}>
                    {bill.PaymentStatus}
                  </span>
                </div>
                <div className="bill-details">
                  <p className="bill-amount">{formatCurrency(bill.Amount)}</p>
                  <p className="bill-date">Billing Date: {formatDate(bill.BillingDate)}</p>
                  {bill.PaymentStatus !== 'Insurance Pending' && (
                    <button 
                      className="pay-now-btn"
                      onClick={() => {
                        setSelectedBill(bill);
                        setPaymentAmount(bill.Amount.toString());
                        setIsPaymentModalOpen(true);
                      }}
                    >
                      <FiCreditCard /> Pay Now
                    </button>
                  )}
                </div>
              </div>
          ))}
        </div>
      </div>

      {/* Payment History Section */}
      <div className="billing-section">
        <h2 className="section-title">
          <FiClock className="section-icon" />
          Payment History
        </h2>
        <div className="payment-history">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Billing Date</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills
                .filter(bill => bill.PaymentStatus !== 'Pending')
                .sort((a, b) => new Date(b.PaymentDate || b.BillingDate) - new Date(a.PaymentDate || a.BillingDate))
                .map(bill => (
                  <tr key={bill.BillingID}>
                    <td>{formatDate(bill.BillingDate)}</td>
                    <td>{getBillSource(bill)}</td>
                    <td className="amount-cell">{formatCurrency(bill.Amount)}</td>
                    <td>{bill.PaymentDate ? formatDate(bill.PaymentDate) : '-'}</td>
                    <td>{bill.PaymentMethod || '-'}</td>
                    <td>
                      <span className={`payment-status ${bill.PaymentStatus.toLowerCase().replace(' ', '-')}`}>
                        {bill.PaymentStatus}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedBill && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h2>Make Payment</h2>
              <button 
                className="close-modal-btn"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setSelectedBill(null);
                }}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleMakePayment} className="payment-form">
              <div className="bill-summary">
                <h3>{getBillSource(selectedBill)}</h3>
                <p className="bill-id">Bill ID: {selectedBill.BillingID}</p>
                <p className="total-amount">Total Amount: {formatCurrency(selectedBill.Amount)}</p>
                {selectedBill.PaymentStatus === 'Partially Paid' && (
                  <p className="remaining-amount">
                    Remaining Balance: {formatCurrency(selectedBill.Amount - selectedBill.PaidAmount)}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="amount">Payment Amount</label>
                <input
                  type="number"
                  id="amount"
                  className="form-control"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  max={selectedBill.Amount}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  className="form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedBill(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <FiCheck /> Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientBilling;