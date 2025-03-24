import React, { useState, useEffect } from "react";
import "./prescriptions.css"; // Styles for the page

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicationName, setMedicationName] = useState("");
    const [dosage, setDosage] = useState("");
    const [patientId, setPatientId] = useState("");

    // Fetch prescriptions from backend
    useEffect(() => {
        fetch("http://localhost:5000/api/prescriptions")
            .then((res) => res.json())
            .then((data) => setPrescriptions(data))
            .catch((error) => console.error("Error fetching prescriptions:", error));
    }, []);

    // Function to add a new prescription
    const addPrescription = () => {
        fetch("http://localhost:5000/api/prescriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ medication_name: medicationName, dosage, patient_id: patientId }),
        })
            .then((res) => res.json())
            .then(() => {
                alert("Prescription added successfully!");
                setMedicationName("");
                setDosage("");
                setPatientId("");
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
                    type="number"
                    placeholder="Patient ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                />
                <button onClick={addPrescription}>Add Prescription</button>
            </div>

            <h3>Existing Prescriptions</h3>
            <ul>
                {prescriptions.map((prescription) => (
                    <li key={prescription.prescription_id}>
                        {prescription.medication_name} - {prescription.dosage} - Patient {prescription.patient_id} - Status: {prescription.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Prescriptions;