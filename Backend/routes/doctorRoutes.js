import { getSpecialists, getAssignedPatients } from '../controllers/doctorController.js';

export function handleDoctorRoutes(req, res) {
  const url = req.url;
  const method = req.method;

  if (url === '/api/doctors/specialists' && method === 'GET') {
    return getSpecialists(req, res);
  }

  const match = url.match(/^\/api\/patients\/assigned\/(\d+)$/);
  if (match && method === 'GET') {
    const doctorId = match[1];
    return getAssignedPatients(req, res, doctorId);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}
