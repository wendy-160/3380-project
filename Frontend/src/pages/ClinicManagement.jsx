import React, { useEffect, useState } from "react";
import './ClinicManagement.css';
const API = process.env.REACT_APP_API_URL;

const ClinicManagement = () => {
    const [clinics, setClinics] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isClinicManagementModalOpen, setIsClinicManagementModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const initialClinicState = {
        OfficeName: '',
        Address: '',
        City: '',
        State: '',
        ZipCode: '',
        PhoneNumber: '',
        OperatingHours: '',
        Email: ''
    };

    const [newClinic, setNewClinic] = useState({...initialClinicState});

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            setError(null);
            setSuccessMessage(null);

            const response = await fetch('${API}/api/offices');

            if(!response.ok) {
                throw new Error(`Error Status: ${response.status}`);
            }

            const data = await response.json();
            const officesData = Array.isArray(data) ? data :
                                (data && data.status === 'success' && Array.isArray(data.data)) ? data.data : null;
        
            if(!officesData) {
                throw new Error('Received invalid data format');
            }
            setClinics(officesData);
        }
        catch (err) {
            console.error('Error fetching clinics:', err);
            setError('Failed to load clinics');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewClinic(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setNewClinic({...initialClinicState});
        setIsEditMode(false);
    };

    const handleAddClinic = async (e) => {
        e.preventDefault();
        
        try {
            setError(null);
            setSuccessMessage(null);
            
            const response = await fetch('${API}/api/offices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClinic)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to add clinic. Server responded with status: ${response.status}`);
            }
            
            resetForm();
            setIsClinicManagementModalOpen(false);
            
            setSuccessMessage('Clinic added successfully!');
            await fetchClinics();
        } 
        catch (err) {
            console.error('Error adding clinic:', err);
            setError(`Failed to add clinic: ${err.message}`);
        }
    };

    const handleEditClinic = async (e) => {
        e.preventDefault();
        
        try {
            setError(null);
            setSuccessMessage(null);
            
            const response = await fetch(`${API}/api/offices/${newClinic.OfficeID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClinic)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to update clinic. Server responded with status: ${response.status}`);
            }
            
            resetForm();
            setIsClinicManagementModalOpen(false);
            
            setSuccessMessage('Clinic updated successfully!');
            await fetchClinics();
        } 
        catch (err) {
            console.error('Error updating clinic:', err);
            setError(`Failed to update clinic: ${err.message}`);
        }
    };

    const handleDeleteClinic = async (clinicId) => {
        if (!window.confirm('Are you sure you want to delete this clinic?')) {
            return;
        }
        
        try {
            setError(null);
            setSuccessMessage(null);
            
            const response = await fetch(`${API}/api/offices/${clinicId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to delete clinic. Server responded with status: ${response.status}`);
            }
            
            setSuccessMessage('Clinic deleted successfully!');
            
            // Refresh clinic list
            await fetchClinics();
        } catch (err) {
            console.error('Error deleting clinic:', err);
            setError(`Failed to delete clinic: ${err.message}`);
        } 
    };

    const handleOpenEditModal = (clinic) => {
        setNewClinic({...clinic});
        setIsEditMode(true);
        setIsClinicManagementModalOpen(true);
    };

    return (
        <div className="clinic-management">
            <div className="header">
                <h1>Clinic Management</h1>
                <p>Add, edit, or remove clinic locations</p>
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

            <div className="add-clinic-button-container">
                <button 
                    className="add-clinic-button"
                    onClick={() => {
                        resetForm();
                        setIsClinicManagementModalOpen(true);
                    }}
                >
                    Add New Clinic
                </button>
            </div>
            
            {isClinicManagementModalOpen && (
                <div className="modal-overlay">
                    <div className="clinic-modal">
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Clinic' : 'Add a New Clinic'}</h2>    
                        </div>  
                        <div className="modal-body">
                            <form onSubmit={isEditMode ? handleEditClinic : handleAddClinic}>
                                <div className="form-row">
                                    <div className="form-group">
                                    <label htmlFor="OfficeName">Clinic Name*</label>
                                        <input
                                            type="text"
                                            id="OfficeName"
                                            name="OfficeName"
                                            value={newClinic.OfficeName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>   
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="Address">Address*</label>
                                        <input
                                            type="text"
                                            id="Address"
                                            name="Address"
                                            value={newClinic.Address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row three-col">
                                    <div className="form-group">
                                        <label htmlFor="City">City*</label>
                                        <input
                                            type="text"
                                            id="City"
                                            name="City"
                                            value={newClinic.City}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="State">State*</label>
                                        <input
                                            type="text"
                                            id="State"
                                            name="State"
                                            value={newClinic.State}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="ZipCode">Zip Code*</label>
                                        <input
                                            type="text"
                                            id="ZipCode"
                                            name="ZipCode"
                                            value={newClinic.ZipCode}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row two-col">
                                    <div className="form-group">
                                        <label htmlFor="PhoneNumber">Phone Number*</label>
                                        <input
                                            type="tel"
                                            id="PhoneNumber"
                                            name="PhoneNumber"
                                            value={newClinic.PhoneNumber}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="Email">Email</label>
                                        <input
                                            type="email"
                                            id="Email"
                                            name="Email"
                                            value={newClinic.Email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="OperatingHours">Operating Hours</label>
                                        <input
                                            type="text"
                                            id="OperatingHours"
                                            name="OperatingHours"
                                            value={newClinic.OperatingHours}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Mon-Fri: 9AM-5PM, Sat: 9AM-1PM"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="btn-cancel"
                                        onClick={() => {
                                            setIsClinicManagementModalOpen(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-add">
                                        {isEditMode ? 'Update Clinic' : 'Add Clinic'}
                                    </button>
                                </div>
                            </form>
                        </div>  
                    </div>
                </div>
            )}
            
            <div className="clinics-list">
                <h2>Existing Clinics ({clinics.length})</h2>
                
                {clinics.length === 0 ? (
                    <p className="no-clinics">No clinics available. Add one using the button above.</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Address</th>
                                    <th>City</th>
                                    <th>State</th>
                                    <th>Phone</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clinics.map(clinic => (
                                    <tr key={clinic.OfficeID}>
                                        <td>{clinic.OfficeName}</td>
                                        <td>{clinic.Address}</td>
                                        <td>{clinic.City}</td>
                                        <td>{clinic.State}</td>
                                        <td>{clinic.PhoneNumber}</td>
                                        <td className="action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleOpenEditModal(clinic)}
                                                title="Edit Clinic"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteClinic(clinic.OfficeID)}
                                                title="Delete Clinic"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClinicManagement;