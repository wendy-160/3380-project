import React, { useState } from 'react';
import axios from 'axios';
import ModalForm from './ModalForm';

const Card = ({ 
  AppointmentID, 
  PatientID, 
  DoctorID, 
  OfficeID, 
  AppointmentDate, 
  AppointmentTime, 
  Duration, 
  Status, 
  userType,
  onUpdate 
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    AppointmentID,
    PatientID,
    DoctorID,
    OfficeID,
    AppointmentDate,
    AppointmentTime,
    Duration,
    Status
  });

  const handleCancel = async () => {
  try {
    const token = localStorage.getItem('token');

    console.log('Cancelling appointment with ID:', appointmentData.AppointmentID);

    // Send DELETE request to cancel the appointment
    const response = await axios.delete(`/api/appointments/${appointmentData.AppointmentID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) {
      // If the appointment is successfully deleted, alert the user and update the state
      alert('Appointment has been successfully deleted.');
      onUpdate(); // Notify the parent to refresh the list of appointments
    }
  } catch (error) {
    console.error('Error canceling appointment:', error);

    if (error.response) {
      console.error('Backend error:', error.response.data);
      alert(error.response.data.message || 'Error canceling the appointment');
    } else {
      alert('An error occurred while canceling the appointment');
    }
  }
};


  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/appointments/${appointmentData.AppointmentID}/approve`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state to reflect approval
      setAppointmentData(prev => ({ ...prev, Status: "approved" }));
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleRefer = async () => {
    try {
      const newDoctorID = prompt('Enter new Doctor ID for referral:');
      if (newDoctorID) {
        const token = localStorage.getItem('token');
  
        // Log the data being sent
        console.log('Sending referral data:', { newDoctorID, updatedByDoctorID: appointmentData.DoctorID });
  
        // Call the backend API to create a referral
        const response = await axios.post(
          `/api/appointments/${appointmentData.AppointmentID}/refer`, 
          { newDoctorID, updatedByDoctorID: appointmentData.DoctorID },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        console.log('Referral response:', response); // Log the response data
  
        // If successful, alert the user and update local state
        if (response.status === 200) {
          alert(response.data.message);
          setAppointmentData(prev => ({ ...prev, DoctorID: newDoctorID }));
        }
      }
    } catch (error) {
      console.error('Error referring appointment:', error);
  
      // Improved error handling
      if (error.response) {
        console.error('Backend error:', error.response.data);
        alert(error.response.data.message || 'Error referring the appointment');
      } else {
        alert('An error occurred while making the referral');
      }
    }
  };
  

  const handleStartSession = async () => {
    try {
      console.log('Session started for appointment:', appointmentData.AppointmentID);
      // Add backend API call to start session if needed
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-md p-4 m-2 w-100 border gap-2">
      <h3 className="text-md font-bold">Appointment ID: {appointmentData.AppointmentID}</h3>
      <div className='flex flex-wrap gap-6'>
        <p><span className='font-semibold'>Patient ID: </span><span className='font-light text-gray-400'>{appointmentData.PatientID}</span></p>
        <p><span className='font-semibold'>Doctor ID: </span><span className='font-light text-gray-400'>{appointmentData.DoctorID}</span></p>
        <p><span className='font-semibold'>Office ID: </span><span className='font-light text-gray-400'>{appointmentData.OfficeID}</span></p>
        <p><span className='font-semibold'>Date: </span><span className='font-light text-gray-400'>{appointmentData.AppointmentDate}</span></p>
        <p><span className='font-semibold'>Time: </span><span className='font-light text-gray-400'>{appointmentData.AppointmentTime}</span></p>
        <p><span className='font-semibold'>Duration: </span><span className='font-light text-gray-400'>{appointmentData.Duration} minutes</span></p>
        <p><span className='font-semibold'>Status: </span><span className='font-light text-gray-400'>{appointmentData.Status}</span></p>
      </div>
      
      <div className="mt-4 flex gap-2">
        

        {(userType === "Doctor" || userType === "Admin") && (
          <>
            {appointmentData.Status === "pending" && (
              <button 
                onClick={handleApprove} 
                className="bg-green-500 text-white py-1 px-3 rounded"
              >
                Approve
              </button>
            )}
            <button 
              onClick={handleRefer} 
              className="bg-blue-500 text-white py-1 px-3 rounded"
            >
              Refer
            </button>
            <button 
              onClick={handleCancel} 
              className="bg-red-500 text-white py-1 px-3 rounded"
            >
              Cancel
            </button>
            {appointmentData.Status === "approved" && (
              <button 
                onClick={handleStartSession} 
                className="bg-purple-500 text-white py-1 px-3 rounded"
              >
                Start Session
              </button>
            )}
          </>
        )}
      </div>

      <ModalForm 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        isEdit={true} 
        existingData={appointmentData} 
        onSave={(updatedData) => {
          setAppointmentData(updatedData);
          onUpdate();
        }} 
      />
    </div>
  );
};

export default Card;