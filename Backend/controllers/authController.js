import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

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
        PhoneNumber, Address, City, State, Zipcode, PrimaryDoctorID
      } = patientInfo;

      await db.query(
        `INSERT INTO patient (
          UserID, FirstName, LastName, DOB, Gender,
          PhoneNumber, Address, City, State, Zipcode, PrimaryDoctorID
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userID, FirstName, LastName, DOB, Gender,
          PhoneNumber, Address, City, State, Zipcode, PrimaryDoctorID || null
        ]
      );
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
  const { email, password } = req.body;

  try {
    const [results] = await db.query("SELECT * FROM login WHERE email = ?", [email]);
    if (results.length === 0) {
      return sendJson(res, 401, { message: "User not found" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
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

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': `auth_token=${token}; HttpOnly; SameSite=Strict; Max-Age=3600`
    });
    res.end(JSON.stringify({
      message: '✅ Login successful',
      token,
      role,
      email: user.email,
      DoctorID,
      PatientID
    }));

  } catch (err) {
    console.error("Login error:", err);
    return sendJson(res, 500, { message: "Server error during login" });
  }
}

function logout(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Set-Cookie': 'auth_token=; Max-Age=0; HttpOnly; SameSite=Strict'
  });
  res.end(JSON.stringify({ message: "✅ Logged out successfully" }));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export { login, register, logout };
