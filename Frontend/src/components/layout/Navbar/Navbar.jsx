import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
            <h1 classname="navbar-logo">UH ClinicHub</h1>
        <ul className="navbar-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to ="/Clinics">Clinics</Link></li>
            <li><Link to="/Doctors">Doctors</Link></li>
            <li><Link to="/Patients">Patients</Link></li>
            <li><Link to="About us">About Us</Link></li>
        </ul>
        <div className="buttons">
          <Link to="/login" className="btn login-button">Login</Link>
          <Link to="/register" className="btn register-button">Register</Link>
        </div>
    </nav>
  );
}

export default Navbar;