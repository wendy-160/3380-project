import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const STATE_MAP = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function register(req, res) {
  const { username, email, password, role = "Patient", patientInfo } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM login WHERE email = ?", [email]);
    if (existing.length > 0) {
      return sendJson(res, 409, { message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [loginResult] = await db.query(
      "INSERT INTO login (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    const userID = loginResult.insertId;

    if (role.toLowerCase() === "patient" && patientInfo) {
      const {
        FirstName, LastName, DOB, Gender,
        PhoneNumber, Address, City, State, Zipcode
      } = patientInfo;

      const [patientResult] = await db.query(
        `INSERT INTO patient (
          UserID, FirstName, LastName, DOB, Gender,
          PhoneNumber, Address, City, State, Zipcode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userID, FirstName, LastName, DOB, Gender,
          PhoneNumber, Address, City, State, Zipcode
        ]
      ); 
      const patientID = patientResult.insertId;
      const [doctorMatch] = await db.query(
        `SELECT d.DoctorID
         FROM doctor d
         JOIN doctor_office dof ON d.DoctorID = dof.DoctorID
         JOIN office o ON dof.OfficeID = o.OfficeID
         WHERE d.Specialization = 'Primary Care Physician' AND o.State = ?
         ORDER BY RAND() LIMIT 1`,
         [STATE_MAP[State] || State]
      );
      if (doctorMatch.length > 0) {
        const assignedDoctorID = doctorMatch[0].DoctorID;
        console.log("Assigning doctor:", assignedDoctorID, "to patient:", patientID);
        await db.query(
          `INSERT INTO patient_doctor_assignment (
            PatientID, DoctorID, AssignmentDate, PrimaryPhysicianFlag
          ) VALUES (?, ?, NOW(), 1)`,
          [patientID, assignedDoctorID]
        );
        console.log("Doctor assigned successfully.");
      } else {
        console.warn("No matching primary care doctor found in state:", State);
      }     
    }

    return sendJson(res, 201, {
      message: "User registered successfully",
      userID,
    });

  } catch (err) {
    console.error("Registration error:", err);
    return sendJson(res, 500, { message: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    console.log("Login route hit");

    if (!req.body) {
      console.error("No request body received");
      return sendJson(res, 400, { message: "Missing request body" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      console.error("Missing email or password");
      return sendJson(res, 400, { message: "Email and password are required" });
    }
    console.log("Checking login table for email:", email);
    const [results] = await db.query("SELECT * FROM login WHERE email = ?", [email]);
    console.log("Query result:", results);

    if (results.length === 0) {
      return sendJson(res, 401, { message: "User not found" });
    }

    const user = results[0];
    console.log("User row from DB:", user);

    if (!user?.password) {
      console.error("No password field on user object");
      return sendJson(res, 500, { message: "User record corrupted: password missing" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
  

    if (!isPasswordValid) {
      return sendJson(res, 401, { message: "Invalid credentials" });
    }

    const role = (user.role || "").toLowerCase();
    const token = jwt.sign({ id: user.UserID, role }, JWT_SECRET, { expiresIn: '1h' });

    let DoctorID = null;
    let PatientID = null;

    if (role === 'doctor') {
      const [doctorRows] = await db.query("SELECT DoctorId FROM doctor WHERE UserID = ?", [user.UserID]);
      if (doctorRows.length > 0) DoctorID = doctorRows[0].DoctorId;
    }

    if (role === 'patient') {
      const [patientRows] = await db.query("SELECT PatientID FROM patient WHERE UserID = ?", [user.UserID]);
      if (patientRows.length > 0) PatientID = patientRows[0].PatientID;
    }

    console.log(`Login success for ${email}, role: ${role}`);

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': `auth_token=${token}; HttpOnly; SameSite=Strict; Max-Age=3600`
    });
    res.end(JSON.stringify({
      message: 'Login successful',
      token,
      role,
      email: user.email,
      DoctorID,
      PatientID
    }));

  } catch (err) {
    console.error("Login error:", err.message);
    return sendJson(res, 500, { message: "Server error during login" });
  }
}


function logout(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Set-Cookie': 'auth_token=; Max-Age=0; HttpOnly; SameSite=Strict'
  });
  res.end(JSON.stringify({ message: "Logged out successfully" }));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export { login, register, logout };