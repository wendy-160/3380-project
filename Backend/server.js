import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import appointmentRoute from './routes/appointmentRoute.js';
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());


app.use('/api/auth', authRoutes);       
app.use('/api/billing', billingRoutes); 
app.use('/api/reports', reportRoutes);  
app.use('/api/prescriptions', prescriptionRoutes);
app.use("/api/appointments", appointmentRoute);

const PORT = process.env.PORT || 5000;
let currentPort = PORT;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      currentPort = port + 1;
      console.log(`⚠️ Port ${port} is already in use. Trying ${currentPort}...`);
      startServer(currentPort);
    } else {
      console.error('❌ Server error:', err);
    }
  });
};

startServer(currentPort);
