import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({ FirstName: '', LastName: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apptRes = await axios.get('http://localhost:5000/api/admin/appointments/past');
        const usersRes = await axios.get('http://localhost:5000/api/admin/users');
        setAppointments(apptRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (user) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${user.role}/${user.ID}`);
      setUsers(prev => prev.filter(u => u.ID !== user.ID));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user.ID);
    setEditedUser({ FirstName: user.FirstName, LastName: user.LastName });
  };

  const handleSave = async (user) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${user.role}/${user.ID}`, editedUser);
      setUsers(prev =>
        prev.map(u => u.ID === user.ID ? { ...u, ...editedUser } : u)
      );
      setEditUserId(null);
    } catch (err) {
      console.error('Failed to save user changes:', err);
    }
  };

  const filteredUsers = roleFilter
    ? users.filter(user => user.role === roleFilter)
    : users;

  const filteredAppointments = statusFilter
    ? appointments.filter(appt => appt.Status === statusFilter)
    : appointments;

  const uniqueRoles = [...new Set(users.map(u => u.role))];
  const uniqueStatuses = [...new Set(appointments.map(a => a.Status))];

  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="section">
        <h2>Past Appointments</h2>
        <label>Status Filter: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          {uniqueStatuses.map(status => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>DateTime</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appt => (
              <tr key={appt.AppointmentID}>
                <td>{appt.AppointmentID}</td>
                <td>{appt.PatientFirstName} {appt.PatientLastName}</td>
                <td>{appt.DoctorFirstName} {appt.DoctorLastName}</td>
                <td>{appt.DateTime}</td>
                <td>{appt.Status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>Users</h2>
        <label>Role Filter: </label>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All</option>
          {uniqueRoles.map(role => (
            <option key={role}>{role}</option>
          ))}
        </select>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First</th>
              <th>Last</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.ID}>
                <td>{user.ID}</td>
                <td>
                  {editUserId === user.ID ? (
                    <input
                      value={editedUser.FirstName}
                      onChange={(e) => setEditedUser({ ...editedUser, FirstName: e.target.value })}
                    />
                  ) : user.FirstName}
                </td>
                <td>
                  {editUserId === user.ID ? (
                    <input
                      value={editedUser.LastName}
                      onChange={(e) => setEditedUser({ ...editedUser, LastName: e.target.value })}
                    />
                  ) : user.LastName}
                </td>
                <td>{user.Email}</td>
                <td>{user.role}</td>
                <td>
                  {editUserId === user.ID ? (
                    <button onClick={() => handleSave(user)}>Save</button>
                  ) : (
                    <button onClick={() => handleEdit(user)}>Edit</button>
                  )}
                  <button onClick={() => handleDelete(user)}>Delete</button>
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
