import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authenticate = (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ message: "❌ Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "❌ Invalid token" });
        req.user = decoded;
        next();
    });
};