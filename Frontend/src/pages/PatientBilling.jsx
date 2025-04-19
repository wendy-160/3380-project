import React, { useState, useEffect } from 'react';
import './PatientBilling.css';

const PatientBilling = () => {
  const [bills, setBills] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState(null);
  const currentPatientID = JSON.parse(localStorage.getItem('user'))?.PatientID;
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (currentPatientID) {
      fetchBillings();
    }
  }, [currentPatientID]);

  const fetchBillings = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/billing/patient/${currentPatientID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch billings: ${response.status}`);
      }
      
      const data = await response.json();
      setBills(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching billings:', error);
      setError('Failed to load billing information. Please try again later.');
      setLoading(false);
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
  
    try {
      const updatedStatus = 'Paid'; 
  
      const response = await fetch(`/api/billing/${selectedBill.BillingID}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: updatedStatus,
          amount: selectedBill.Amount, 
          paymentMethod: paymentMethod || 'Credit Card',
          paymentDate: new Date().toISOString().split('T')[0]
        })
      });
  
      if (!response.ok) throw new Error('Payment update failed');
  
      setIsPaymentModalOpen(false);
      setSelectedBill(null);
      setPaymentAmount('');
      setPaymentMethod('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setError(null);
      alert("Payment successful! This bill is now marked as Paid.");
      fetchBillings();
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Payment processing failed. Please try again later.');
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
    <div className="patient-billing-page">
      <h1 className="patient-billing-title">Billing & Payments</h1>
      
      {error && (
        <div className="patient-billing-error">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="patient-billing-spinner">
          <p>Loading billing information...</p>
        </div>
      ) : (
        <>

          <div className="patient-billing-section">
            <h2 className="patient-billing-section-title">
              Outstanding Bills
            </h2>
            <div className="patient-billing-grid">
              {bills.filter(bill => ['Pending', 'Partially Paid', 'Insurance Pending', 'Overdue'].includes(bill.PaymentStatus)).length === 0 ? (
                <div className="patient-billing-empty">
                  <div className="patient-billing-empty-icon">
                  </div>
                  <p>You have no outstanding bills</p>
                </div>
              ) : (
                bills
                  .filter(bill => ['Pending', 'Partially Paid', 'Insurance Pending', 'Overdue'].includes(bill.PaymentStatus))
                  .map(bill => (
                    <div key={bill.BillingID} className={`patient-billing-card ${bill.PaymentStatus.toLowerCase().replace(' ', '-')}`}>
                      <div className="patient-billing-header">
                        <div>
                          <h3>{getBillSource(bill)}</h3>
                          <span className="patient-billing-type">{bill.Description || 'Medical Service'}</span>
                        </div>
                        <span className={`patient-billing-status ${bill.PaymentStatus.toLowerCase().replace(' ', '-')}`}>
                          {bill.PaymentStatus}
                        </span>
                      </div>
                      <div className="patient-billing-details">
                        <p className="patient-billing-amount">{formatCurrency(bill.Amount)}</p>
                        <p className="patient-billing-date">Billing Date: {formatDate(bill.BillingDate)}</p>
                        {bill.PaymentStatus !== 'Insurance Pending' && (
                          <button 
                            className="patient-billing-btn"
                            onClick={() => {
                              setSelectedBill(bill);
                              setPaymentAmount(bill.Amount.toString());
                              setIsPaymentModalOpen(true);
                            }}
                          >
                          Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                ))
              )}
            </div>
          </div>
          

          <div className="patient-billing-section">
            <h2 className="patient-billing-section-title">
              Payment History
            </h2>
            <div className="patient-payment-history">
              <table className="patient-payment-table">
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
                        <td className="patient-amount-cell">{formatCurrency(bill.Amount)}</td>
                        <td>{bill.PaymentDate ? formatDate(bill.PaymentDate) : '-'}</td>
                        <td>{bill.PaymentMethod || '-'}</td>
                        <td>
                          <span className={`patient-payment-status ${bill.PaymentStatus.toLowerCase().replace(' ', '-')}`}>
                            {bill.PaymentStatus}
                          </span>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {isPaymentModalOpen && selectedBill && (
        <div className="patient-modal-overlay">
          <div className="patient-payment-modal">
            <div className="patient-modal-header">
              <h2>Make Payment</h2>
              <button 
                className="patient-close-modal-btn"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setSelectedBill(null);
                }}
              > x
              </button>
            </div>
            <form onSubmit={handleMakePayment} className="patient-payment-form">
              <div className="patient-bill-summary">
                <h3>{getBillSource(selectedBill)}</h3>
                <p className="patient-bill-id">Bill ID: {selectedBill.BillingID}</p>
                <p className="patient-total-amount">Total Amount: {formatCurrency(selectedBill.Amount)}</p>
                {selectedBill.PaymentStatus === 'Partially Paid' && (
                  <p className="patient-remaining-amount">
                    Remaining Balance: {formatCurrency(selectedBill.Amount - selectedBill.PaidAmount)}
                  </p>
                )}
              </div>

              <div className="patient-form-group">
                <label htmlFor="amount">Payment Amount</label>
                <input
                  type="number"
                  id="amount"
                  className="patient-form-control"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  max={selectedBill.Amount}
                  required
                />
              </div>

              <div className="patient-form-group">
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  className="patient-form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>
              <div className="patient-form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  className="patient-form-control"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>

              <div className="patient-form-group">
                <label htmlFor="expiry">Expiration Date</label>
                <input
                  type="text"
                  id="expiry"
                  className="patient-form-control"
                  placeholder="MM/YY"
                  maxLength="5"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
              </div>

              <div className="patient-form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  className="patient-form-control"
                  placeholder="123"
                  maxLength="3"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </div>

              

              <div className="patient-form-actions">
                <button 
                  type="button" 
                  className="patient-cancel-btn"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedBill(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="patient-submit-btn">
                  Confirm Payment
                </button>
              </div>
            </form>
            
            {error && (
              <div className="patient-modal-error">
                 {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientBilling;