import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV",
  "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
  "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    dob: "",
    phone: "",
    address: "",
    city: "",
    state: "TX",
    zipcode: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
  
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username: form.username,
          email: form.email,
          password: form.password,
          role: "Patient",
          patientInfo: {
            FirstName: form.firstName,
            LastName: form.lastName,
            Gender: form.gender,
            DOB: form.dob,
            PhoneNumber: form.phone,
            Address: form.address,
            City: form.city,
            State: form.state,
            Zipcode: form.zipcode,
            PrimaryDoctorID: null
          }
        },
        { withCredentials: true }
      );
  
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Register as a Patient</h2>

      <input name="username" type="text" placeholder="Username" value={form.username} onChange={handleChange} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
      <input name="firstName" type="text" placeholder="First Name" value={form.firstName} onChange={handleChange} />
      <input name="lastName" type="text" placeholder="Last Name" value={form.lastName} onChange={handleChange} />
      
      <label>Gender</label>
      <select name="gender" value={form.gender} onChange={handleChange}>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <label>Date of Birth</label>
      <input name="dob" type="date" value={form.dob} onChange={handleChange} />
      <input name="phone" type="text" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
      <input name="address" type="text" placeholder="Address" value={form.address} onChange={handleChange} />
      <input name="city" type="text" placeholder="City" value={form.city} onChange={handleChange} />

      <label>State</label>
      <select name="state" value={form.state} onChange={handleChange}>
        {US_STATES.map((st) => (
          <option key={st} value={st}>{st}</option>
        ))}
      </select>

      <input name="zipcode" type="text" placeholder="Zipcode" value={form.zipcode} onChange={handleChange} />

      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
    </div>
  );
};

export default Register;