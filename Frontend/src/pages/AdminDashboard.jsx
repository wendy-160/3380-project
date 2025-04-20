import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import AddDoctorForm from '../components/AddDoctorForm.jsx';
const API = process.env.REACT_APP_API_URL;



const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({ FirstName: '', LastName: '' , Email: ''});
  const [clinicFilter, setClinicFilter] = useState('');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');


  const [newDoctor, setNewDoctor] = useState({
  FirstName: '',
  LastName: '',
  Email: '',
  Username: '',
  Password: '',
  Specialization: '',
  PhoneNumber: ''
  });
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apptRes = await axios.get(`${API}/api/admin/appointments/full`);
        const usersRes = await axios.get(`${API}/api/admin/users`);
        const res = await axios.get(`${API}/api/admin/clinics`);
        const patientRes = await axios.get(`${API}/api/admin/patients`);
        
        setPatients(patientRes.data);
        setClinics(res.data);
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
      await axios.delete(`${API}/api/admin/users/${user.role.toLowerCase()}/${user.UserID}`);
      setUsers(prev => prev.filter(u => u.CompositeID !== user.CompositeID));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user.CompositeID);
    setEditedUser({ FirstName: user.DoctorFirstName || user.PatientFirstName, LastName: user.DoctorLastName || user.PatientLastName, Email: user.Email || '' });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditedUser({ FirstName: '', LastName: '', Email: '' });
  };

  const handleSave = async (user) => {
    try {
      await axios.put(`/api/admin/users/${user.role.toLowerCase()}/${user.DoctorID || user.PatientID}`, {
        FirstName: editedUser.FirstName,
        LastName: editedUser.LastName,
        Email: editedUser.Email
      });
  
      setUsers(prev =>
        prev.map(u =>
          u.CompositeID === user.CompositeID ? {
            ...u,
            FirstName: editedUser.FirstName,
            LastName: editedUser.LastName,
            Email: editedUser.Email
          } : u
        )
      );
      cancelEdit();
    } catch (err) {
      console.error('Failed to save user changes:', err);
    }
  };

  const filteredUsers = roleFilter
    ? users.filter(user => user.role === roleFilter)
    : users;

  const filteredAppointments = appointments.filter(a => {
    const statusMatches = !statusFilter || a.Status?.toLowerCase() === statusFilter.toLowerCase();
    const clinicMatches = !clinicFilter || String(a.OfficeID) === String(clinicFilter);
    return statusMatches && clinicMatches;
  }); 

  const uniqueRoles = [...new Set(users.map(u => u.role))];
  const uniqueStatuses = [...new Set(appointments.map(a => a.Status))];
  const uniqueClinics = [...new Set(appointments.map(a => a.OfficeName))];

  const handleReassign = async () => {
    if (!selectedPatient || !selectedDoctor) {
      alert('Please select both a patient and a doctor.');
      return;
    }
  
    try {
      await axios.put(`${API}/api/admin/reassign-doctor`, {
        PatientID: selectedPatient,
        DoctorID: selectedDoctor
      });
      alert('Patient reassigned successfully');
      setSelectedPatient('');
      setSelectedDoctor('');
    } catch (err) {
      console.error('Failed to reassign patient:', err);
      alert('Failed to reassign patient');
    }
  };

  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-section">
        <h2>Appointments</h2>
        <label>Status Filter: </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            {uniqueStatuses.map(status => (
              <option key={status}>{status}</option>
            ))}
          </select>
        <label>Clinic Filter: </label>
          <select value={clinicFilter} onChange={(e) => setClinicFilter(e.target.value)}>
            <option value="">All</option>
            {clinics.map(clinic => (
              <option key={clinic.OfficeID} value={clinic.OfficeID}>
                {clinic.OfficeName}
              </option>
            ))}
          </select>

        <table>
          <thead>
            <tr>
              <th>AppointmentID</th>
              <th>Patient Name</th>
              <th>DoctorID</th>
              <th>Doctor Name</th>
              <th>ClinicID</th>
              <th>Clinic Name</th>
              <th>DateTime</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appt => (
              <tr key={appt.AppointmentID}>
                <td>{appt.AppointmentID}</td>
                <td>{appt.PatientFirstName} {appt.PatientLastName}</td>
                <td>{appt.DoctorID}</td>
                <td>{appt.DoctorFirstName} {appt.DoctorLastName}</td>
                <td>{appt.OfficeID}</td>
                <td>{appt.OfficeName}</td>
                <td>{new Date(appt.DateTime).toLocaleString([], {
                  year: 'numeric',
                  month: 'short',   
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}</td>
                <td>{appt.Status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="users-section">
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
              <th>UserID</th>
              <th>DoctorID</th>
              <th>PatientID</th>
              <th>First</th>
              <th>Last</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {filteredUsers.map(user => {
            const isEditing = editingUserId === user.CompositeID;
            return (
              <tr key={user.CompositeID}>
                <td>{user.UserID}</td>
                <td>{user.DoctorID || '-'}</td>
                <td>{user.PatientID || '-'}</td>
                <td>{isEditing ? (
                <input
                  value={editedUser.FirstName}
                  onChange={(e) => setEditedUser({ ...editedUser, FirstName: e.target.value })}
                />
              ) : (user.FirstName || user.DoctorFirstName || user.PatientFirstName)}</td>

              <td>{isEditing ? (
                <input
                  value={editedUser.LastName}
                  onChange={(e) => setEditedUser({ ...editedUser, LastName: e.target.value })}
                />
              ) : (user.LastName || user.DoctorLastName || user.PatientLastName)}</td>
                <td>{isEditing ? (
                  <input
                    value={editedUser.Email}
                    onChange={(e) => setEditedUser({ ...editedUser, Email: e.target.value })}
                  />
                ) : user.Email}</td>
                <td>{user.role}</td>
                <td>
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSave(user)}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => startEditing(user)}>Edit</button>
                  )}
                  <button onClick={() => handleDelete(user)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
      <div className="add-doctor-button-wrapper">
  <button onClick={() => setShowDoctorModal(true)} className="schedule-appointment-btn">
    Add Doctor
  </button>
</div>

{showDoctorModal && (
  <div className="modal-overlay">
    <div className="appointment-modal">
      <div className="modal-header">
        <h2>Add New Doctor</h2>
        <button className="close-modal-btn" onClick={() => setShowDoctorModal(false)}>x</button>
      </div>
      <div className="modal-body">
      <form
  onSubmit={(e) => {
    e.preventDefault();
    axios.post(`${API}/api/admin/users/doctor`, {
      FirstName: newDoctor.FirstName,
  LastName: newDoctor.LastName,
  Email: newDoctor.Email,
  Username: newDoctor.Username,
  Password: newDoctor.Password,
  Specialization: newDoctor.Specialization,
  PhoneNumber: newDoctor.PhoneNumber
    }).then(() => {
      setShowDoctorModal(false);
      window.location.reload();
    }).catch(err => {
      console.error("Failed to add doctor:", err);
    });
  }}
>
  <label>First Name</label>
  <input
    type="text"
    required
    value={newDoctor.FirstName}
    onChange={(e) => setNewDoctor({ ...newDoctor, FirstName: e.target.value })}
  />

  <label>Last Name</label>
  <input
    type="text"
    required
    value={newDoctor.LastName}
    onChange={(e) => setNewDoctor({ ...newDoctor, LastName: e.target.value })}
  />

  <label>Email</label>
  <input
    type="email"
    required
    value={newDoctor.Email}
    onChange={(e) => setNewDoctor({ ...newDoctor, Email: e.target.value })}
  />
  <label>Username</label>
<input
  type="text"
  required
  value={newDoctor.Username}
  onChange={(e) => setNewDoctor({ ...newDoctor, Username: e.target.value })}
/>

<label>Password</label>
<input
  type="password"
  required
  value={newDoctor.Password}
  onChange={(e) => setNewDoctor({ ...newDoctor, Password: e.target.value })}
/>

  <label>Specialization</label>
  <input
    type="text"
    required
    value={newDoctor.Specialization}
    onChange={(e) => setNewDoctor({ ...newDoctor, Specialization: e.target.value })}
  />

  <label>Phone Number</label>
  <input
    type="text"
    required
    value={newDoctor.PhoneNumber}
    onChange={(e) => setNewDoctor({ ...newDoctor, PhoneNumber: e.target.value })}
  />

  <div className="modal-actions">
    <button className="submit-btn" type="submit">Submit</button>
    <button className="cancel-btn" type="button" onClick={() => setShowDoctorModal(false)}>Cancel</button>
  </div>
</form>
</div>
    </div>
  </div>
)}

<div className="dashboard-section">
  <h2>Reassign Patient to Another Doctor</h2>
  <label>Select Patient:</label>
  <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
    <option value="">-- Select Patient --</option>
    {patients.map((p) => (
      <option key={p.PatientID} value={p.PatientID}>
        {p.FirstName} {p.LastName}
      </option>
    ))}
  </select>

  <label>Select New Doctor:</label>
  <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
    <option value="">-- Select Doctor --</option>
    {users.filter(u => u.role === 'Doctor').map((d) => (
      <option key={d.DoctorID} value={d.DoctorID}>
        {d.DoctorFirstName} {d.DoctorLastName}
      </option>
    ))}
  </select>

  <button onClick={handleReassign}>Reassign</button>
</div>

    </div>
  );
};

export default AdminDashboard;