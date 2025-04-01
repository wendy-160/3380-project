import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import MedicalTests from './pages/medicaltests.jsx';
import Prescriptions from './pages/prescriptions.jsx';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard.jsx';
import Reports from './pages/Reports.jsx';  
import Billing from './pages/Billing.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import './App.css';
import Appointments from './pages/Appointment.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {user ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          {user.role == "Admin" && <Link to="/reports">Reports</Link>}
          {user.role == "Doctor" && <Link to="/prescriptions">Prescriptions</Link>} 
          {user.role =="Doctor" && <Link to="/tests">Medical Tests</Link>}
 
          <Link to="/billing">Billing</Link>
          <button onClick={() => { logout(); window.location.href = "/"; }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};


const AdminRoute = ({ element }) => {
  const { user } = useAuth();
  return user && user.role === "Admin" ? element : <Navigate to="/dashboard" />;
};
const DoctorRoute = ({ element }) => {
  const { user } = useAuth();
  return user && user.role === "Doctor" ? element : <Navigate to="/dashboard" />;
};

const PatientRoute = ({ element }) => {
  const { user } = useAuth();
  return user && user.role === "Patient" ? element : <Navigate to="/dashboard" />;
};

export default function App() {
  return (
    <AuthProvider>
      <div>
        <h1>Medical Clinic App</h1>
        <Navbar />
        <Routes>
          <Route path="/" element={<h2>Welcome to the Clinic Homepage</h2>} />
          <Route path="/tests" element={<DoctorRoute element={<MedicalTests />} />} />
          <Route path="/prescriptions" element={<DoctorRoute element={<Prescriptions />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<AdminRoute element={<Reports />} />} /> 
          <Route path="/billing" element={<Billing/>}/> 
          <Route path="/appointments" element={<PatientRoute element={<Appointments/>}/>}/>
        </Routes>
      </div>
    </AuthProvider>
  );
}