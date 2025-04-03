import React, { useState, useEffect } from "react";
import "./medicaltests.css"; // Styles for the page

const MedicalTests = () => {
    const [tests, setTests] = useState([]);
    const [testType, setTestType] = useState("");
    const [patientId, setPatientId] = useState("");

    // Fetch medical tests from backend
    useEffect(() => {
        fetch("http://localhost:5000/api/medicaltests")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);  // Check the structure of the data
                setTests(data);
            })
            .catch((error) => console.error("Error fetching tests:", error));
    }, []);
    // Function to add a new test
    const orderTest = () => {
        fetch("http://localhost:5000/api/medicaltests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ test_type: testType, patient_id: patientId }),
        })
            .then((res) => res.json())
            .then(() => {
                alert("Test ordered successfully!");
                setTestType("");
                setPatientId("");
            })
            .catch((error) => console.error("Error ordering test:", error));
    };

    return (
        <div className="medical-tests">
            <h2>Medical Tests</h2>

            <div className="order-form">
                <input
                    type="text"
                    placeholder="Test Type"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Patient ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                />
                <button onClick={orderTest}>Order Test</button>
            </div>

            <h3>Existing Tests</h3>
            <ul>
                {tests.map((test) => (
                    <li key={test.test_id}>
                        {test.test_type} - Patient {test.patient_id} - Status: {test.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MedicalTests;