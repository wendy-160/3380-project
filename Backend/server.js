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
import { handleOfficeRoutes } from './routes/officeRoutes.js'

dotenv.config();

const PORT = process.env.PORT || 5000;
let currentPort = PORT;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  const headers = req.headers;

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  req.cookies = parseCookie(headers.cookie || '');

  if (['POST', 'PUT'].includes(method)) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        req.body = parse(body);
      }

      routeRequest(req, res, pathname, method);
    });
  } else {
    routeRequest(req, res, pathname, method);
  }
});

function routeRequest(req, res, pathname, method) {
  console.log(`Incoming request: ${method} ${pathname}`);

  if ((pathname === '/' || pathname === '') && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Medical Clinic API is running!' }));
    return;
  }
  
  if (pathname.startsWith('/api/auth')) {
    return handleAuthRoutes(req, res);
  } else if (pathname.startsWith('/api/billing')) {
    return handleBillingRoutes(req, res);
  } else if (pathname.startsWith('/api/reports')) {
    return handleReportRoutes(req, res);
  } else if (pathname.startsWith('/api/prescriptions')) {
    return handlePrescriptionRoutes(req, res);
  } else if (pathname.startsWith('/api/appointments')) {
    return handleAppointmentRoutes(req, res);
  } else if (pathname.startsWith('/api/tests')) {
    return handleTestRoutes(req, res);
  } else if (pathname.startsWith('/api/offices')) {
    return handleOfficeRoutes(req,res);
  } else if (
    pathname.startsWith('/api/doctors') ||
    pathname.startsWith('/api/patients/assigned') ||
    pathname.match(/^\/api\/patients\/\d+\/primary-physician$/)
  ) {
    return handleDoctorRoutes(req, res);
  } else if (pathname.startsWith('/api/patients')) {
    return handlePatientRoutes(req, res);
  } else if (pathname.startsWith('/api/referrals')) {
    return handleReferralRoutes(req, res);
  } else {
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