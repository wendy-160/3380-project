import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Assuming you have an auth context to manage user sessions
import axios from 'axios';
import './AdminDashboard.css'; // Add your styles here

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch appointments and users when the component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const appointmentsResponse = await axios.get('http://localhost:5000/api/appointments');
        const usersResponse = await axios.get('http://localhost:5000/api/users');
        
        setAppointments(appointmentsResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="section">
        <h2>Appointments</h2>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.AppointmentID}>
                <td>{appointment.AppointmentID}</td>
                <td>{appointment.PatientName}</td>
                <td>{appointment.DoctorName}</td>
                <td>{appointment.DateTime}</td>
                <td>{appointment.Status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>Manage Users</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.UserID}>
                <td>{user.UserID}</td>
                <td>{user.Name}</td>
                <td>{user.Email}</td>
                <td>{user.Role}</td>
                <td>
                  {/* Add buttons for actions like edit, delete, or update roles */}
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;