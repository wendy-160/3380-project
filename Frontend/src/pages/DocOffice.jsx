import React, { useState, useEffect } from 'react';
import './DocOffice.css';
const API = process.env.REACT_APP_API_URL;

const DoctorClinicAssignment = () => {
    const [clinics, setClinics] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    
    // State for new assignment
    const [newAssignment, setNewAssignment] = useState({
        DoctorID: '',
        OfficeID: '',
        WorkDays: '',
        WorkHours: ''
    });
    
    // Filter states
    const [selectedClinic, setSelectedClinic] = useState('all');
    const [selectedDoctor, setSelectedDoctor] = useState('all');

    useEffect(() => {
        Promise.all([
            fetchClinics(),
            fetchDoctors(),
            fetchAssignments()
        ]).finally(() => {
            setLoading(false);
        });
    }, []);

    // Fetch all clinics
    const fetchClinics = async () => {
        try {
            const response = await fetch(`${API}/api/offices`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch clinics. Status: ${response.status}`);
            }
            
            const data = await response.json();
            const clinicsData = Array.isArray(data) ? data : 
                              (data && data.status === 'success' && Array.isArray(data.data)) ? data.data : [];
            
            setClinics(clinicsData);
            return clinicsData;
        } catch (err) {
            console.error('Error fetching clinics:', err);
            setError(`Failed to load clinics: ${err.message}`);
            return [];
        }
    };

    // Fetch all doctors
    const fetchDoctors = async () => {
        try {
            const response = await fetch(`${API}/api/doctors`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch doctors. Status: ${response.status}`);
            }
            
            const data = await response.json();
            const doctorsData = Array.isArray(data) ? data : 
                              (data && data.status === 'success' && Array.isArray(data.data)) ? data.data : [];
            
            setDoctors(doctorsData);
            return doctorsData;
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setError(`Failed to load doctors: ${err.message}`);
            return [];
        }
    };

    // Fetch all doctor-clinic assignments
    const fetchAssignments = async () => {
        try {
            const response = await fetch(`${API}/api/doctor-offices`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch assignments. Status: ${response.status}`);
            }
            
            const data = await response.json();
            const assignmentsData = Array.isArray(data) ? data : 
                                  (data && data.status === 'success' && Array.isArray(data.data)) ? data.data : [];
            
            setAssignments(assignmentsData);
            return assignmentsData;
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setError(`Failed to load assignments: ${err.message}`);
            return [];
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAssignment(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const resetForm = () => {
        setNewAssignment({
            DoctorID: '',
            OfficeID: '',
            WorkDays: '',
            WorkHours: ''
        });
    };

    // Create a new doctor-clinic assignment
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        console.log("Form submission triggered");
        
        try {
            setError(null);
            setSuccessMessage(null);
            
            const formattedAssignment = {
                DoctorID: parseInt(newAssignment.DoctorID, 10),
                OfficeID: parseInt(newAssignment.OfficeID, 10),
                WorkDays: newAssignment.WorkDays,
                WorkHours: newAssignment.WorkHours
            };
            
            console.log('Sending assignment data:', JSON.stringify(formattedAssignment));
            
            const response = await fetch(`${API}/api/doctor-offices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedAssignment)
            });
            
            // Check if the response is successful (includes 204 No Content)
            if (response.ok) {
                console.log(`Assignment created successfully (Status: ${response.status})`);
                setSuccessMessage('Doctor assigned to clinic successfully!');
                resetForm();
                setIsAssignmentModalOpen(false);

                setTimeout(async () => {
                    await fetchAssignments();
                }, 200);
    
                return;
            }
            
            // If we get here, there was an error
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || `Server error: ${response.status}`;
                console.error('Error response data:', errorData);
            } catch (parseError) {
                errorMessage = `Failed to create assignment. Status: ${response.status}`;
                console.error('Failed to parse error response:', parseError);
            }
            throw new Error(errorMessage);
        } catch (err) {
            console.error('Error creating assignment:', err);
            setError(`Failed to assign doctor: ${err.message}`);
        }
    };


    const handleDeleteAssignment = async (doctorId, officeId) => {
        if (!window.confirm('Are you sure you want to remove this doctor from the clinic?')) {
            return;
        }
        
        try {
            setError(null);
            setSuccessMessage(null);
            
            console.log(`Attempting to delete assignment: doctorId=${doctorId}, officeId=${officeId}`);
            
            const response = await fetch(`${API}/api/doctor-offices/${doctorId}/${officeId}`, {
                method: 'DELETE'
            });
            
            console.log('Delete response status:', response.status);
            
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || `Server error: ${response.status}`;
                } catch (parseError) {
                    errorMessage = `Failed to delete assignment. Status: ${response.status}`;
                }
                throw new Error(errorMessage);
            }
            
            setSuccessMessage('Doctor removed from clinic successfully!');
            
            // Refresh assignments data
            await fetchAssignments();
        } catch (err) {
            console.error('Error deleting assignment:', err);
            setError(`Failed to remove doctor: ${err.message}`);
        }
    };

    const getDoctorName = (doctorId) => {
        const doctor = doctors.find(d => d.DoctorID === doctorId);
        return doctor ? `${doctor.FirstName} ${doctor.LastName}` : 'Unknown Doctor';
    };


    const getClinicName = (officeId) => {
        const clinic = clinics.find(c => c.OfficeID === officeId);
        return clinic ? clinic.OfficeName : 'Unknown Clinic';
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesClinic = selectedClinic === 'all' || assignment.OfficeID.toString() === selectedClinic;
        const matchesDoctor = selectedDoctor === 'all' || assignment.DoctorID.toString() === selectedDoctor;
        return matchesClinic && matchesDoctor;
    });


    const assignmentsByClinic = {};
    clinics.forEach(clinic => {
        const clinicAssignments = filteredAssignments.filter(a => a.OfficeID === clinic.OfficeID);
        if (selectedClinic === 'all' || clinic.OfficeID.toString() === selectedClinic) {
            assignmentsByClinic[clinic.OfficeID] = {
                clinicName: clinic.OfficeName,
                assignments: clinicAssignments
            };
        }
    });

    // Group assignments by doctor for the second view
    const assignmentsByDoctor = {};
    doctors.forEach(doctor => {
        const doctorAssignments = filteredAssignments.filter(a => a.DoctorID === doctor.DoctorID);
        if (selectedDoctor === 'all' || doctor.DoctorID.toString() === selectedDoctor) {
            assignmentsByDoctor[doctor.DoctorID] = {
                doctorName: `${doctor.FirstName} ${doctor.LastName}`,
                assignments: doctorAssignments
            };
        }
    });

    if (loading) {
        return (
            <div className="doctor-clinic-assignment">
                <div className="loading-message">
                    <p>Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="doctor-clinic-assignment">
            <div className="header">
                <h1>Doctor-Clinic Assignments</h1>
                <p>Manage where doctors work</p>
                
                <div className="actions">
                    <button 
                        className="add-button"
                        onClick={() => {
                            resetForm();
                            setIsAssignmentModalOpen(true);
                        }}
                    >
                    Assign Doctor to Clinic
                    </button>
                </div>
            </div>
            
            {successMessage && (
                <div className="success-message">
                    <p>{successMessage}</p>
                    <button onClick={() => setSuccessMessage(null)}>×</button>
                </div>
            )}
            
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}
            
            {/* Filters */}
            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="clinic-filter">Filter by Clinic:</label>
                    <select 
                        id="clinic-filter" 
                        value={selectedClinic} 
                        onChange={(e) => setSelectedClinic(e.target.value)}
                    >
                        <option value="all">All Clinics</option>
                        {clinics.map(clinic => (
                            <option key={clinic.OfficeID} value={clinic.OfficeID.toString()}>
                                {clinic.OfficeName}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-group">
                    <label htmlFor="doctor-filter">Filter by Doctor:</label>
                    <select 
                        id="doctor-filter" 
                        value={selectedDoctor} 
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                        <option value="all">All Doctors</option>
                        {doctors.map(doctor => (
                            <option key={doctor.DoctorID} value={doctor.DoctorID.toString()}>
                                {doctor.FirstName} {doctor.LastName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* View by Clinic */}
            <div className="view-section">
                <h2>Clinics and Their Doctors</h2>
                
                {Object.keys(assignmentsByClinic).length === 0 ? (
                    <p className="no-data-message">No clinic assignments match your filters.</p>
                ) : (
                    <div className="clinic-cards">
                        {Object.values(assignmentsByClinic).map(({ clinicName, assignments }) => (
                            <div className="clinic-card" key={clinicName}>
                                <h3>{clinicName}</h3>
                                
                                {assignments.length === 0 ? (
                                    <p className="no-doctors">No doctors assigned to this clinic</p>
                                ) : (
                                    <ul className="doctor-list">
                                        {assignments.map(assignment => (
                                            <li key={`${assignment.DoctorID}-${assignment.OfficeID}`}>
                                                <div className="doctor-info">
                                                    <span className="doctor-name">{getDoctorName(assignment.DoctorID)}</span>
                                                    <div className="schedule-info">
                                                        <div><strong>Days:</strong> {assignment.WorkDays || 'Not specified'}</div>
                                                        <div><strong>Hours:</strong> {assignment.WorkHours || 'Not specified'}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="remove-button"
                                                    onClick={() => handleDeleteAssignment(assignment.DoctorID, assignment.OfficeID)}
                                                    title="Remove doctor from this clinic"
                                                >
                                                    Delete
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* View by Doctor */}
            <div className="view-section">
                <h2>Doctors and Their Clinics</h2>
                
                {Object.keys(assignmentsByDoctor).length === 0 ? (
                    <p className="no-data-message">No doctor assignments match your filters.</p>
                ) : (
                    <div className="doctor-cards">
                        {Object.values(assignmentsByDoctor).map(({ doctorName, assignments }) => (
                            <div className="doctor-card" key={doctorName}>
                                <h3>{doctorName}</h3>
                                
                                {assignments.length === 0 ? (
                                    <p className="no-clinics">Not assigned to any clinics</p>
                                ) : (
                                    <ul className="clinic-list">
                                        {assignments.map(assignment => (
                                            <li key={`${assignment.DoctorID}-${assignment.OfficeID}`}>
                                                <div className="clinic-info">
                                                    <span className="clinic-name">{getClinicName(assignment.OfficeID)}</span>
                                                    <div className="schedule-info">
                                                        <div><strong>Days:</strong> {assignment.WorkDays || 'Not specified'}</div>
                                                        <div><strong>Hours:</strong> {assignment.WorkHours || 'Not specified'}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="remove-button"
                                                    onClick={() => handleDeleteAssignment(assignment.DoctorID, assignment.OfficeID)}
                                                    title="Remove from this clinic"
                                                >
                                                    Delete
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Assignment Modal */}
            {isAssignmentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Assign Doctor to Clinic</h2>
                            <button 
                                className="close-button"
                                onClick={() => {
                                    resetForm();
                                    setIsAssignmentModalOpen(false);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <form id="assignmentForm" onSubmit={handleCreateAssignment}>
                                <div className="form-group">
                                    <label htmlFor="DoctorID">Doctor*</label>
                                    <select
                                        id="DoctorID"
                                        name="DoctorID"
                                        value={newAssignment.DoctorID}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select a doctor</option>
                                        {doctors.map(doctor => (
                                            <option key={doctor.DoctorID} value={doctor.DoctorID}>
                                                {doctor.FirstName} {doctor.LastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="OfficeID">Clinic*</label>
                                    <select
                                        id="OfficeID"
                                        name="OfficeID"
                                        value={newAssignment.OfficeID}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select a clinic</option>
                                        {clinics.map(clinic => (
                                            <option key={clinic.OfficeID} value={clinic.OfficeID}>
                                                {clinic.OfficeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="WorkDays">Work Days</label>
                                    <input
                                        type="text"
                                        id="WorkDays"
                                        name="WorkDays"
                                        value={newAssignment.WorkDays}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Mon, Wed, Fri"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="WorkHours">Work Hours</label>
                                    <input
                                        type="text"
                                        id="WorkHours"
                                        name="WorkHours"
                                        value={newAssignment.WorkHours}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 9:00 AM - 5:00 PM"
                                    />
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-button"
                                        onClick={() => {
                                            resetForm();
                                            setIsAssignmentModalOpen(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="submit-button"
                                    >
                                        Assign Doctor
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorClinicAssignment;