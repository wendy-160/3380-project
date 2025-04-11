import React from 'react';
import { useAuth } from '../context/AuthContext';  
import PatientDashboard from './PatientDashboard';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';

const Dashboard = () => {
  const { user } = useAuth(); 
  if (!user) {
    return <p>You need to log in to see your dashboard.</p>;
  }

  const role = user.Role?.toLowerCase();

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      return <p>Invalid role.</p>;
  }
};

export default Dashboard;
