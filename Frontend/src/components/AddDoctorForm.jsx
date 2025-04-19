import React, { useState } from 'react';
import axios from 'axios';

const AddDoctorForm = ({ onClose, onDoctorAdded }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    FirstName: '',
    LastName: '',
    Specialization: '',
    PhoneNumber: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/doctors/register', formData);
      setMessage('Doctor added successfully!');
      setFormData({
        username: '',
        password: '',
        email: '',
        FirstName: '',
        LastName: '',
        Specialization: '',
        PhoneNumber: ''
      });
      onDoctorAdded?.();
      onClose();
    } catch (err) {
      console.error('Failed to add doctor:', err);
      setMessage('Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="add-doctor-form" onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input name="FirstName" placeholder="First Name" value={formData.FirstName} onChange={handleChange} required />
      <input name="LastName" placeholder="Last Name" value={formData.LastName} onChange={handleChange} required />
      <input name="Specialization" placeholder="Specialization" value={formData.Specialization} onChange={handleChange} required />
      <input name="PhoneNumber" placeholder="Phone Number" value={formData.PhoneNumber} onChange={handleChange} required />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="submit" disabled={submitting}>Submit</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
      {message && <p>{message}</p>}
    </form>
  );
};

export default AddDoctorForm;