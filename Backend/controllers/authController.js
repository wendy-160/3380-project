import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const register = async (req, res) => {
    const { username, name, email, password, role } = req.body; 
  
    try {
      console.log("Incoming registration:", req.body);

      const [existing] = await db.query("SELECT * FROM login WHERE email = ?", [email]);
      if (existing.length > 0) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = "INSERT INTO login (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)";
  
      await db.query(sql, [username, name, email, hashedPassword, role || "patient"]);
      res.status(201).json({ message: "User registered successfully" });
  
    } catch (err) {
      console.error("❌ Registration error:", err); 
      res.status(500).json({ message: "Registration failed" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const [results] = await db.query("SELECT * FROM login WHERE email = ?", [email]);
        if (results.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.UserID, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, 
        });

        res.status(200).json({
            message: '✅ Login successful',
            token,
            role: user.role,
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
};

export const logout = (req, res) => {
    res.clearCookie('auth_token'); 
    res.json({ message: "✅ Logged out successfully" });
};