import { getAllDoctors, getSpecialists, getAssignedPatients, getPrimaryPhysician, getDoctorOffices, getDoctorById, handleRegisterDoctor } from '../controllers/doctorController.js';
const API = process.env.REACT_APP_API_URL;

export function handleDoctorRoutes(req, res) {
  const url = req.url;
  const method = req.method;

  if (url === '/api/doctors' && method === 'GET') {
    return getAllDoctors(req, res);
  }

  if (url === '/api/doctors/specialists' && method === 'GET') {
    return getSpecialists(req, res);
  }
  if (method === 'POST' && url === '/api/doctors/register') {
    return handleRegisterDoctor(req, res);
  }


  const doctorByIdMatch = url.match(/^\/api\/doctors\/(\d+)$/);
  if (doctorByIdMatch && method === 'GET') {
    const doctorId = doctorByIdMatch[1];
    return getDoctorById(req, res, doctorId);
  }

  const assignedMatch = url.match(/^\/api\/patients\/assigned\/(\d+)$/);
  if (assignedMatch && method === 'GET') {
    const doctorId = assignedMatch[1];
    return getAssignedPatients(req, res, doctorId);
  }

  const primaryPhysicianMatch = url.match(/^\/api\/patients\/(\d+)\/primary-physician$/);
  if (primaryPhysicianMatch && method === 'GET') {
    const patientId = primaryPhysicianMatch[1];
    return getPrimaryPhysician(req, res, patientId);
  }
  const officeMatch = url.match(/^\/api\/doctors\/(\d+)\/offices$/);
  if (officeMatch && method === 'GET') {
    const doctorId = officeMatch[1];
    return getDoctorOffices({ ...req, params: { doctorId } }, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Route not found' }));
}