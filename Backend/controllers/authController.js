const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a new user
export const register = async (req, res) => {
    const { username, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO login (username, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(sql, [username, email, hashedPassword, role], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: '✅ User registered successfully' });
    });
};

// Login user
export const login = (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM login WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: "❌ User not found" });

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return res.status(401).json({ message: "❌ Invalid credentials" });

        const token = jwt.sign({ id: user.UserID, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('auth_token', token, { httpOnly: true });
        res.json({ message: '✅ Login successful', token, role: user.role });
    });
};

// Logout user
export const logout = (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: "✅ Logged out successfully" });
};