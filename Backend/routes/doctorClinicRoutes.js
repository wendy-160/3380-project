import { getAllDoctorOffices, createDoctorOffice, getDoctorOfficesByOffice, getDoctorOfficesByDoctor, updateDoctorOffice, deleteDoctorOffice } from '../controllers/doctorClinicController.js';

export function handleDoctorOfficeRoutes(req, res) {
  console.log('Doctor office route handler called with:', req.url, 'Method:', req.method);
  console.log('Request headers:', req.headers)

  const pathname = req.url.split('?')[0]; 
  const method = req.method;

  console.log('Matching path:', pathname, 'Method:', method);

  if (pathname === '/api/doctor-offices' && method === 'GET') {
    console.log('Handling GET all doctor offices');
    return getAllDoctorOffices(req, res);
  }

  if (pathname === '/api/doctor-offices' && method === 'POST') {
    console.log('Handling POST new doctor-office assignment');
    return createDoctorOffice(req, res);
  }

  const officeMatch = pathname.match(/^\/api\/doctor-offices\/office\/(\d+)$/);
  if (officeMatch && method === 'GET') {
    console.log(`Handling GET doctor-offices by office ID: ${officeMatch[1]}`);
    req.params = { officeId: officeMatch[1] };
    return getDoctorOfficesByOffice(req, res);
  }

  const doctorMatch = pathname.match(/^\/api\/doctor-offices\/doctor\/(\d+)$/);
  if (doctorMatch && method === 'GET') {
    console.log(`Handling GET doctor-offices by doctor ID: ${doctorMatch[1]}`);
    req.params = { doctorId: doctorMatch[1] };
    return getDoctorOfficesByDoctor(req, res);
  }

  // Handle the direct pattern used by the frontend for DELETE and UPDATE
  const directMatch = pathname.match(/^\/api\/doctor-offices\/(\d+)\/(\d+)$/);
  if (directMatch) {
    console.log(`Matched direct path pattern with IDs: ${directMatch[1]}, ${directMatch[2]}`);
    req.params = { 
      doctorId: directMatch[1],
      officeId: directMatch[2]
    };
    
    if (method === 'PUT') {
      console.log(`Handling PUT update for doctor ${directMatch[1]} at office ${directMatch[2]}`);
      return updateDoctorOffice(req, res);
    }
    
    if (method === 'DELETE') {
      console.log(`Handling DELETE for doctor ${directMatch[1]} at office ${directMatch[2]}`);
      return deleteDoctorOffice(req, res);
    }
  }

  console.log('No matching route found for:', pathname, 'Method:', method);
  return false;
}