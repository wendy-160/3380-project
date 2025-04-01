import React from 'react';
import { useAuth } from '../context/AuthContext';  
import PatientDashboard from './PatientDashboard';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth(); 
  if (!user) {
    return <p>You need to log in to see your dashboard.</p>;
  }
  
  switch(user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Doctor':
      return <DoctorDashboard />;
    case 'Patient':
      return <PatientDashboard />;
    default:
      return <p>Invalid role.</p>;
  }
};

/*
  return (
    <div>
      <h2>Welcome to Your Dashboard</h2>
      {user ? (
        <div>
          <p>Hello, {user.username}</p>
          <p>{user.role} Dashboard</p>
          {user.role === 'Admin' && (
            <div>
            <p>Admin-specific content here.</p>
            <ul>
              <li>Manage users</li>
              <li>Doctors: </li>
              <li>Patients: </li>
            </ul>
            <Link to="/reports">
              <button> Create Reports </button>
            </Link>
            </div>
            )}
          {user.role === 'Doctor' && (
            <div>
            <p>Doctor-specific content here.</p>
            <ul>
              <li>View patient records</li>
              <li>Manage appointments</li>
              <li>Prescribe medications</li>
            </ul>
            </div>
            )}
          {user.role === 'Patient' && (
            <div>
            <p>Patient-specific content here.</p>
            <ul>
              <li>Book appointments</li>
              <li>View prescriptions</li>
              <li>Access medical history</li>
            </ul>
            </div>
            )}
        </div>
      ) : (
        <p>You need to log in to see your dashboard.</p>
      )}
    </div>
  );
};
*/
export default Dashboard;