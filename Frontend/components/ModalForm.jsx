import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TextInput = ({ name, placeholder, value, onChange }) => (
  <input 
    type="text" 
    name={name} 
    placeholder={placeholder} 
    value={value} 
    onChange={onChange} 
    className="w-full p-3 border-2 border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500" 
  />
);

const ModalForm = ({ isOpen, onClose, onSave, isEdit = false, existingData = {} }) => {
  const [formData, setFormData] = useState({ 
    DoctorID: '', 
    OfficeID: '', 
    AppointmentDate: '', 
    AppointmentTime: '', 
    Duration: 60 
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && existingData) {
      setFormData(existingData);
    }
  }, [isEdit, existingData]); // Run only when isEdit or existingData changes

  if (!isOpen) return null;

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.DoctorID || !formData.AppointmentDate || !formData.AppointmentTime) {
      setError("DoctorID, AppointmentDate, and AppointmentTime are required!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const currentPatientID = JSON.parse(localStorage.getItem('user'))?.PatientID;

      if (isEdit) {
        await axios.put(`/api/appointments/${formData.AppointmentID}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Appointment updated successfully');
      } else {
        const response = await axios.post('/api/appointments', 
          { 
            AppointmentID: generateAppointmentID(), 
            PatientID: currentPatientID, 
            ...formData 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Appointment created successfully:', response.data);
      }

      onSave(); // Trigger the save function from the parent (Dashboard)
      onClose();
      window.location.reload(); // Refresh the dashboard
    } catch (error) {
      console.error('Error saving appointment:', error);
      setError('Failed to save appointment. Please try again.');
    }
  };
  const generateAppointmentID = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
    const randomNumbers = Math.floor(100 + Math.random() * 900);
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    return `${randomLetters}${randomNumbers}${randomLetter}`;
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative">
        <button className="absolute top-2 right-2 text-red-500 text-2xl font-bold" onClick={onClose}>&times;</button>
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          {isEdit ? 'Edit Appointment' : 'Create Appointment'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <TextInput name="DoctorID" placeholder="Doctor ID" value={formData.DoctorID} onChange={handleChange} />
          <TextInput name="OfficeID" placeholder="Office ID" value={formData.OfficeID} onChange={handleChange} />
          <input type="date" name="AppointmentDate" value={formData.AppointmentDate} onChange={handleChange} />
          <input type="time" name="AppointmentTime" value={formData.AppointmentTime} onChange={handleChange} />
          <input type="number" name="Duration" value={formData.Duration} onChange={handleChange} />
          
          {error && <p className="text-red-500 col-span-2">{error}</p>}

          <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded col-span-2">
            {isEdit ? 'Update Appointment' : 'Save Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;