import { getSpecialists, getAssignedPatients, getPrimaryPhysician } from '../controllers/doctorController.js';

export function handleDoctorRoutes(req, res) {
  const url = req.url;
  const method = req.method;

  if (url === '/api/doctors/specialists' && method === 'GET') {
    return getSpecialists(req, res);
  }

  // Existing route for assigned patients
  const assignedMatch = url.match(/^\/api\/patients\/assigned\/(\d+)$/);
  if (assignedMatch && method === 'GET') {
    const doctorId = assignedMatch[1];
    return getAssignedPatients(req, res, doctorId);
  }

  // New route for primary physician
  const primaryPhysicianMatch = url.match(/^\/api\/patients\/(\d+)\/primary-physician$/);
  if (primaryPhysicianMatch && method === 'GET') {
    const patientId = primaryPhysicianMatch[1];
    return getPrimaryPhysician(req, res, patientId);
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}