import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Home.css';


const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <h2>Welcome to the Clinic Homepage</h2>
      <p>
        Your one-stop platform for managing healthcare — from booking appointments to accessing prescriptions.
      </p>

      {user && (
        <p>Welcome back, {user.username}! You are logged in as a <strong>{user.role}</strong>.</p>
      )}

      <ul className="home-links">
        <li><Link to="/appointments">📅 Schedule an Appointment</Link></li>
        <li><Link to="/dashboard">🏠 Go to Dashboard</Link></li>
        <li><Link to="/billing">💳 Billing Information</Link></li>
      </ul>
    </div>
  );
};

export default Home;
