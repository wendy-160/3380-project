import React, { useState, useEffect, useMemo } from 'react';
import './Locations.css';
const API = process.env.REACT_APP_API_URL;

const Locations = () => {
    const [clinics, setClinics] = useState([]);
    const [selectedState, setSelectedState] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchClinics = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API}/api/offices`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();

                const officesData = Array.isArray(data) ? data : 
                                   (data && data.status === 'success' && Array.isArray(data.data)) ? data.data : 
                                   null;
                
                if (!officesData) {
                    console.error('Unexpected API response format:', data);
                    throw new Error('Received invalid data format from server');
                }
                
                const mappedClinics = officesData.map(office => ({
                    id: office.OfficeID,
                    name: office.OfficeName,
                    address: office.Address,
                    city: office.City,
                    state: office.State,
                    zipCode: office.ZipCode,
                    phone: office.PhoneNumber,
                    hours: office.OperatingHours || 'Not specified',
                    email: office.Email || 'Not specified'
                }));
                
                setClinics(mappedClinics);
                setError(null);
            } catch (err) {
                console.error('Error fetching clinics:', err);
                setError('Failed to load clinic locations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchClinics();
    }, []);
    
    const states = [...new Set(clinics.map(clinic => clinic.state))].sort();
    
    const filteredClinics = selectedState === 'all' 
        ? clinics 
        : clinics.filter(clinic => clinic.state === selectedState);
        const clinicsByState = useMemo(() => {
            const grouped = {};
            if (selectedState === 'all') {
                states.forEach(state => {
                    const stateClinics = filteredClinics.filter(clinic => clinic.state === state);
                    if (stateClinics.length > 0) {
                        grouped[state] = stateClinics;
                    }
                });
            } else {
                grouped[selectedState] = filteredClinics;
            }
            return grouped;
        }, [filteredClinics, selectedState, states]);
        
    if (loading) {
        return (
            <div className="container">
                <div className="loading-container">
                    <p>Loading clinic locations...</p>
                </div>
            </div>
        );
    }

    if (clinics.length === 0) {
        return (
            <div className="container">
                <div className="header">
                    <h1 className="page-title">Our Clinic Locations</h1>
                    <p className="page-description">
                        Find a clinic in our network 
                    </p>
                </div>
                <div className="no-clinics">
                    <p>No clinic locations are currently available.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="container">
            <div className="header">
                <h1 className="page-title">Our Clinic Locations</h1>
                <p className="page-description">
                    Find a clinic in our network 
                </p>
            </div>

            <div className="filter-container">
                <label htmlFor="state-select" className="filter-label">Select a state:</label>
                <select
                    id="state-select"
                    className="state-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                >
                    <option value="all">All States</option>
                    {states.map((state, index) => (
                        <option key={index} value={state}>{state}</option>
                    ))}
                </select>
            </div>
            
            {Object.keys(clinicsByState).length > 0 ? (
                Object.entries(clinicsByState).map(([state, stateClinics]) => (
                    <div key={state} className="state-section">
                        <h2 className="state-heading">
                            {state}
                        </h2>
                        
                        <div className="clinics-grid">
                            {stateClinics.map(clinic => (
                                <div key={clinic.id} className="clinic-card">
                                    <div className="clinic-content">
                                        <h2 className="clinic-name">{clinic.name}</h2>
                                        
                                        <div className="info-row">
                                            <span className="location">Location: </span>
                                            <p className="info-text">
                                                {clinic.address}, {clinic.city}, {clinic.state} {clinic.zipCode}
                                            </p>
                                        </div>
                                        
                                        <div className="info-row">
                                            <span className="phone">Phone Number: </span>
                                            <p className="info-text">{clinic.phone}</p>
                                        </div>
                                        
                                        <div className="info-row">
                                            <span className="hours">Hours: </span>
                                            <p className="info-text">{clinic.hours}</p>
                                        </div>
                                        
                                        <div className="info-row">
                                            <span className="email">Email: </span>
                                            <p className="info-text">{clinic.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="no-results">
                    <p>No clinics match your current selection. Please try another state.</p>
                </div>
            )}
        </div>
    );
};

export default Locations;