import { getDoctorScheduleAvailability, updateDoctorScheduleAvailability} from '../controllers/scheduleController.js';
  
export function handleScheduleRoutes(req, res) {
    const url = req.url;
    const method = req.method;
  
    const matchGet = url.match(/^\/api\/schedule\/availability\/(\d+)$/);
    const matchPut = url.match(/^\/api\/schedule\/availability\/(\d+)\/(\d+)$/);
  
    if (matchGet && method === 'GET') {
      req.params = { doctorId: matchGet[1] };
      return getDoctorScheduleAvailability(req, res);
    }
  
    if (matchPut && method === 'PUT') {
      req.params = {
        doctorId: matchPut[1],
        officeId: matchPut[2]
      };
      return updateDoctorScheduleAvailability(req, res);
    }
  
    return false;
}
