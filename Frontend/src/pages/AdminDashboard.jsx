import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Card from '../../components/Card';
import ModalForm from '../../components/ModalForm';


const AdminDashboard = () => {
    const { user } = useAuth();
    const [allAppointments, setAllAppointments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

  useEffect(() => {
    if(!user?.AdminID) return;

    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments. Please try again.');
      }
    };

    fetchAppointments();
  }, [user?.AdminID]);

  const handleSave = (formData) => {
    console.log('Saved Data:', formData); // Replace with actual backend saving logic
    setIsModalOpen(false);
  };

  return (
    <div>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-green-500 text-white py-1 px-4 rounded m-4"
      >
        New Appointment
      </button>

      <div className="flex flex-wrap justify-center">
        {allAppointments.length > 0 ? (
          allAppointments.map(appointment => (
            <Card key={appointment.AppointmentID} {...appointment} userType="admin" />
          ))
        ) : (
          <p>No appointments found.</p>
        )}
      </div>

      <ModalForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
      />
    </div>
  );
};

export default AdminDashboard;