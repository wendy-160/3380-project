import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import MedicalTests from './pages/medicaltests.jsx';
import Prescriptions from './pages/prescriptions.jsx';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard.jsx';
import Reports from './pages/Reports.jsx';  
import PatientBilling from './pages/PatientBilling.jsx';
import AdminBilling from './pages/AdminBilling.jsx'
import About from './components/AboutUs.jsx';
import Locations from './components/Locations.jsx';
import Home from './Home.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import './App.css';
import Appointments from './pages/Appointment.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="web-app-name">UH ClinicHub</Link>
        <Link to="/about-us">About Us</Link>
        <Link to="/locations">Locations</Link>
        {user && (
          <>
          <Link to="/dashboard">Dashboard</Link>
          {user.role === "Admin" && <Link to="/reports">Reports</Link>}
          {user.role === "Doctor" && <Link to="/prescriptions">Prescriptions</Link>}
          {user.role === "Doctor" && <Link to="/tests">Medical Tests</Link>}
          {user.role === "Patient" && <Link to="/PatientBilling">Billing</Link>}
          {user.role === "Admin" && <Link to="/AdminBilling">Billing</Link>}
          <button onClick={() => { logout(); window.location.href = "/"; }} className="nav-button">Logout</button>
          </>
        )}
      </div>

      {!user && (
        <div className="navbar-right">
          <Link to="/login" className="nav-button">Login</Link>
          <Link to="/register" className="nav-button">Register</Link>
        </div>
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
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<About/>} />
          <Route path="/locations" element={<Locations/>}/>
          <Route path="/tests" element={<DoctorRoute element={<MedicalTests />} />} />
          <Route path="/prescriptions" element={<DoctorRoute element={<Prescriptions />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<AdminRoute element={<Reports />} />} /> 
          <Route path="/PatientBilling" element={<PatientBilling/>}/> 
          <Route path="/AdminBilling" element={<AdminBilling/>}/> 
          <Route path="/appointments" element={<PatientRoute element={<Appointments/>}/>}/>
        </Routes>
        
      </div>
    </AuthProvider>
  );
}