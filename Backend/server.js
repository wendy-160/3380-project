import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import { parse } from 'querystring';
import { parse as parseCookie } from 'cookie';

import { handleAuthRoutes } from './routes/authRoutes.js';
import { handleBillingRoutes } from './routes/billingRoutes.js';
import { handleReportRoutes } from './routes/reportRoutes.js';
import { handlePrescriptionRoutes } from './routes/prescriptionRoutes.js';
import { handleAppointmentRoutes } from './routes/appointmentRoute.js';
import { handleTestRoutes } from './routes/testRoutes.js';
import { handlePatientRoutes } from './routes/patientRoutes.js';
import { handleDoctorRoutes } from './routes/doctorRoutes.js';
import { handleReferralRoutes } from './routes/referralRoutes.js';
import { handleOfficeRoutes } from './routes/officeRoutes.js';
import { handleDoctorOfficeRoutes } from './routes/doctorClinicRoutes.js';
import { handleAdminRoutes } from './routes/adminRoutes.js';
import { handleMedicalRecordRoutes } from './routes/medicalRecordRoutes.js';
import { handleScheduleRoutes } from './routes/scheduleRoutes.js';
const API = process.env.REACT_APP_API_URL;


dotenv.config();

const PORT = process.env.PORT || 5000;
let currentPort = PORT;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  const headers = req.headers;

  const allowedOrigins = [
    'http://localhost:3000',
    'https://3380-project-git-main-jsnvus-projects.vercel.app',
    'https://3380-project-one.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-email');

  if (method === 'OPTIONS') {
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-email');
    res.writeHead(204);
    return res.end();
  }
  

  req.cookies = parseCookie(headers.cookie || '');

  if (['POST', 'PUT'].includes(method)) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        req.body = parse(body);
      }

      console.log(`Parsed body for ${method} ${pathname}:`, req.body);
      routeRequest(req, res, pathname, method, parsedUrl);
    });
  } else {
    routeRequest(req, res, pathname, method, parsedUrl);
  }
});

function routeRequest(req, res, pathname, method, parsedUrl) {
  console.log(`Incoming request: ${method} ${pathname}`);

  if ((pathname === '/' || pathname === '') && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Medical Clinic API is running!' }));
    return;
  }

  if (pathname.startsWith('/api/admin')) {
    console.log('Routing to adminRoutes');
    return handleAdminRoutes(req, res);
  }
   else if (pathname.startsWith('/api/auth')) {
    console.log('Routing to authRoutes');
    return handleAuthRoutes(req, res, parsedUrl);
  } else if (pathname.startsWith('/api/billing')) {
    console.log('Routing to billingRoutes');
    return handleBillingRoutes(req, res);
  } else if (pathname.startsWith('/api/reports')) {
    console.log('Routing to reportRoutes');
    return handleReportRoutes(req, res);
  } else if (pathname.startsWith('/api/prescriptions')) {
    console.log('Routing to prescriptionRoutes');
    return handlePrescriptionRoutes(req, res);
  } else if (pathname.startsWith('/api/appointments')) {
    console.log('Routing to appointmentRoutes');
    return handleAppointmentRoutes(req, res);
  } else if (pathname.startsWith('/api/tests')) {
    console.log('Routing to testRoutes');
    return handleTestRoutes(req, res);
  } else if (pathname.startsWith('/api/offices')) {
    console.log('Routing to officeRoutes');
    return handleOfficeRoutes(req, res);
  } else if (pathname.startsWith('/api/medical-records')){
    console.log('Routing to medicalRecordRoutes');
    return handleMedicalRecordRoutes(req, res);
  } else if (pathname.startsWith('/api/schedule')){
    console.log('Routing to scheduleRoutes');
    return handleScheduleRoutes(req,res);
  } else if (
    pathname.startsWith('/api/doctors') ||
    pathname.startsWith('/api/patients/assigned') ||
    pathname.match(/^\/api\/patients\/\d+\/primary-physician$/)
  ) {
    console.log('Routing to doctorRoutes');
    return handleDoctorRoutes(req, res);
  } else if (pathname.startsWith('/api/patients')) {
    console.log('Routing to patientRoutes');
    return handlePatientRoutes(req, res);
  } else if (pathname.startsWith('/api/referrals')) {
    console.log('Routing to referralRoutes');
    return handleReferralRoutes(req, res);
  } else if (pathname.startsWith('/api/doctor-offices')) {
    console.log('Routing to doctorOfficeRoutes');
    return handleDoctorOfficeRoutes(req, res);
  } else if (
    pathname.startsWith('/api/admin') || 
    pathname === '/api/users' || 
    pathname.match(/^\/api\/users\/\d+$/) ||
    pathname === '/api/users/role'
  ) {
    return handleAdminRoutes(req, res);
  } else {
    console.warn('Route not found:', pathname);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    currentPort++;
    console.log(`Port ${currentPort - 1} in use. Trying ${currentPort}...`);
    server.listen(currentPort);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(currentPort, () => {
  console.log(`Server running on port ${currentPort}`);
});
