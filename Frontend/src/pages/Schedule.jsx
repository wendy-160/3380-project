import React, { useEffect, useState } from 'react';
import './Schedule.css';
const API = process.env.REACT_APP_API_URL;

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getStartDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const timeFormat = { hour: '2-digit', minute: '2-digit' };

const Schedule = ({ doctorId }) => {
    const [availability, setAvailability] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState(null);
    const [calendarFilterOffice, setCalendarFilterOffice] = useState('all');
    const [message, setMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
    const [showDayModal, setShowDayModal] = useState(false);
  
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getStartDayOfMonth(year, month);
  
    useEffect(() => {
        fetch(`${API}/api/schedule/availability/${doctorId}`)
        .then(res => res.json())
        .then(data => {
          setAvailability(data);
          if (data.length > 0) setSelectedOffice(data[0].OfficeID);
        });
    }, [doctorId]);
  
    useEffect(() => {
      if (!doctorId) return;
    
      fetch(`${API}/api/appointments/doctor/${doctorId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAppointments(data);
          } else {
            console.error("Expected array but got:", data);
            setAppointments([]);
          }
        })
        .catch(err => {
          console.error("Failed to fetch appointments:", err);
          setAppointments([]);
        });
    }, [doctorId]);
    
  
    const handleChange = (field, value) => {
      setAvailability(prev =>
        prev.map(entry =>
          entry.OfficeID === selectedOffice ? { ...entry, [field]: value } : entry
        )
      );
    };
  
    const handleSave = async () => {
      const current = availability.find(a => a.OfficeID === selectedOffice);
      const res = await fetch(`${API}/api/schedule/availability/${doctorId}/${selectedOffice}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            WorkDays: current.WorkDays,
            WorkHours: current.WorkHours,
        }),
      });
      const data = await res.json();
      setMessage(data.message);
      setModalOpen(false);
    };
  
    const filteredAppointments = calendarFilterOffice === 'all'
      ? appointments
      : appointments.filter(a => a.OfficeID === Number(calendarFilterOffice));
  
    const apptMap = {};
    filteredAppointments.forEach(appt => {
      const dateKey = new Date(appt.DateTime).toISOString().split('T')[0];
      if (!apptMap[dateKey]) apptMap[dateKey] = [];
      apptMap[dateKey].push(appt);
    });
  
    const weeks = [];
    let currentDay = 1 - startDay;
    while (currentDay <= daysInMonth) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        if (currentDay > 0 && currentDay <= daysInMonth) {
          const dateObj = new Date(year, month, currentDay);
          const dateKey = dateObj.toISOString().split('T')[0];
          days.push({
            day: currentDay,
            dateKey,
            appointments: apptMap[dateKey] || [],
          });
        } else {
          days.push(null);
        }
        currentDay++;
      }
      weeks.push(days);
    }
  
    const openDayModal = (appointments) => {
      setSelectedDayAppointments(appointments);
      setShowDayModal(true);
    };
  
    return (
      <div className="doctor-schedule-page">
        <h1>Schedule Management</h1>

        <div className="availability-editor-section">
          <h2>My Availability</h2>
          <button onClick={() => setModalOpen(true)}>Edit Availability</button>
          {message && <p style={{ marginTop: '0.5rem' }}>{message}</p>}
        </div>
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Availability</h3>
              <label>
                Select Office:
                <select
                  value={selectedOffice || ''}
                  onChange={(e) => setSelectedOffice(Number(e.target.value))}
                >
                  {availability.map((a) => (
                    <option key={a.OfficeID} value={a.OfficeID}>
                      {a.OfficeName ? a.OfficeName : `Office #${a.OfficeID}`}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Work Days:
                <input
                  type="text"
                  placeholder="Mon, Tue, Wed, Thur, etc."
                  value={
                    availability.find((a) => a.OfficeID === selectedOffice)?.WorkDays || ''
                  }
                  onChange={(e) => handleChange('WorkDays', e.target.value)}
                />
              </label>
              <label>
                Work Hours:
                <input
                  type="text"
                  placeholder="9:00-17:00"
                  value={
                    availability.find((a) => a.OfficeID === selectedOffice)?.WorkHours || ''
                  }
                  onChange={(e) => handleChange('WorkHours', e.target.value)}
                />
              </label>
              <div className="modal-actions">
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setModalOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {showDayModal && (
        <div className="modal-overlay">
          <div className="modal-content day-modal">
            <div className="modal-header">
              <h3>Appointments for {selectedDayAppointments.length > 0 ? 
                new Date(selectedDayAppointments[0].DateTime).toLocaleDateString([], {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Selected Day'}
              </h3>
              <button className="close-button" onClick={() => setShowDayModal(false)}>×</button>
            </div>
            
            {selectedDayAppointments.length === 0 ? (
              <div className="no-appointments">
                <p>No appointments scheduled for this day.</p>
              </div>
            ) : (
              <div className="appointments-list">
                {selectedDayAppointments.map((appt, index) => (
                  <div key={index} className={`appointment-card ${appt.status === 'Completed' ? 'completed' : ''}`}>
                    <div className="appointment-time">
                      {new Date(appt.DateTime).toLocaleTimeString([], timeFormat)}
                    </div>
                    <div className="appointment-details">
                      <div className="patient-name">{appt.PatientFirstName} {appt.PatientLastName}</div>
                      <div className="appointment-location">{appt.OfficeName || `Office #${appt.OfficeID}`}</div>
                      <div className="appointment-status">{appt.status || 'Scheduled'}</div>
                    </div>
                    {appt.status !== 'Completed' && (
                      <button
                        className="complete-button"
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API}/api/appointments/${appt.AppointmentID}/complete`, {
                              method: 'PUT'
                            });
                            const data = await res.json();
                            console.log(data.message);

                            const updatedRes = await fetch(`${API}/api/appointments/doctor/${doctorId}`);
                            const updatedData = await updatedRes.json();
                            setAppointments(updatedData);

                            const dateKey = new Date(appt.DateTime).toISOString().split('T')[0];
                            const updatedDay = updatedData.filter(a =>
                              new Date(a.DateTime).toISOString().split('T')[0] === dateKey
                            );
                            setSelectedDayAppointments(updatedDay);

                          } catch (err) {
                            console.error('Error marking complete:', err);
                          }
                        }}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="modal-footer">
            </div>
          </div>
        </div>
      )}
        <div className="calendar-section">
          <h2>
            {today.toLocaleString('default', { month: 'long' })} {year}
          </h2>
          <label>
            Filter Appointments by Office:
            <select
              value={calendarFilterOffice}
              onChange={(e) => setCalendarFilterOffice(e.target.value)}
            >
              <option value="all">All Offices</option>
              {availability.map((o) => (
                <option key={o.OfficeID} value={o.OfficeID}>
                  Office #{o.OfficeID}
                </option>
              ))}
            </select>
          </label>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-cell calendar-header">
                {day}
              </div>
            ))}
            {weeks.map((week, wi) => (
              <React.Fragment key={wi}>
                {week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className="calendar-cell calendar-day"
                    onClick={() => cell && openDayModal(cell.appointments)}
                  >
                    {cell && (
                      <>
                        <div className="calendar-day-number">{cell.day}</div>
                        {cell.appointments.map((appt, i) => (
                          <div key={i} className="calendar-appt">
                            {appt.PatientFirstName} {appt.PatientLastName} <br />
                            {new Date(appt.DateTime).toLocaleTimeString([], timeFormat)} <br />
                            {appt.OfficeName}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };
  

export default Schedule;
