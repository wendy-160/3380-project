import React, { useState, useEffect } from "react";
import "./prescriptions.css"; // Styles for the page

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicationName, setMedicationName] = useState("");
    const [dosage, setDosage] = useState("");
    const [frequency, setFrequency] = useState("");
    const [patientId, setPatientId] = useState("");
    const [duration, setDuration] = useState("");

    // Fetch prescriptions for a specific patient (replace `patientId` with actual patient)
    useEffect(() => {
        fetch(`http://localhost:5000/api/prescriptions/patient/${patientId}`)
            .then((res) => res.json())
            .then((data) => setPrescriptions(data))
            .catch((error) => console.error("Error fetching prescriptions:", error));
    }, [patientId]);

    // Function to add a new prescription
    const addPrescription = () => {
        fetch("http://localhost:5000/api/prescriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                PatientID: patientId,
                MedicationName: medicationName,
                Dosage: dosage,
                Frequency: frequency,
                DatePrescribed: new Date().toISOString().split('T')[0],  // Date format: YYYY-MM-DD
                Duration: duration,
            }),
        })
            .then((res) => res.json())
            .then(() => {
                alert("Prescription added successfully!");
                setMedicationName("");
                setDosage("");
                setFrequency("");
                setPatientId("");
                setDuration("");
            })
            .catch((error) => console.error("Error adding prescription:", error));
    };

    return (
        <div className="prescriptions">
            <h2>Prescriptions</h2>

            <div className="prescription-form">
                <input
                    type="text"
                    placeholder="Medication Name"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Patient ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <button onClick={addPrescription}>Add Prescription</button>
            </div>

            <h3>Existing Prescriptions</h3>
            <ul>
                {prescriptions.map((prescription) => (
                    <li key={prescription.PrescriptionID}>
                        {prescription.MedicationName} - {prescription.Dosage} - {prescription.Frequency} - Status: {prescription.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Prescriptions;
