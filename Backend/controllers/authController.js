import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req, res) => {
  const { username, name, email, password, role } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM login WHERE email = ?", [email]);
    if (existing.length > 0) {
      return sendJson(res, 409, { message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO login (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)";
    await db.query(sql, [username, name, email, hashedPassword, role || "Patient"]);

    return sendJson(res, 201, { message: "User registered successfully" });

  } catch (err) {
    console.error("Registration error:", err);
    return sendJson(res, 500, { message: "Registration failed" });
  }
};

export const login = async (req, res) => {
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

    const rawRole = user.role || user.Role;
    const role = rawRole ? rawRole.toLowerCase() : null;
    console.log("Resolved role is:", role);

    if (!role || !['doctor', 'patient', 'admin'].includes(role)) {
      return sendJson(res, 400, { message: "Invalid role." });
    }

    const token = jwt.sign({ id: user.UserID, role }, JWT_SECRET, { expiresIn: '1h' });

    let DoctorID = null;
    let PatientID = null;

    if (role === 'doctor') {
      const [doctorRows] = await db.query("SELECT DoctorId FROM doctor WHERE UserID = ?", [user.UserID]);
      console.log("Doctor lookup result:", doctorRows);
      if (doctorRows.length > 0) {
        DoctorID = doctorRows[0].DoctorId;
      }
    } else if (role === 'patient') {
      const [patientRows] = await db.query("SELECT PatientID FROM patient WHERE UserID = ?", [user.UserID]);
      if (patientRows.length > 0) {
        PatientID = patientRows[0].PatientID;
      }
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
};

export const logout = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Set-Cookie': 'auth_token=; Max-Age=0; HttpOnly; SameSite=Strict'
  });
  res.end(JSON.stringify({ message: "✅ Logged out successfully" }));
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
