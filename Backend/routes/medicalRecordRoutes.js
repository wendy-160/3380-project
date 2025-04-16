import {
  handleGetMedicalRecordsByPatientId,
  handleCreateMedicalRecord,
  handleSearchMedicalRecords
} from '../controllers/medicalRecordController.js';

export function handleMedicalRecordRoutes(req, res) {
  const { url: rawUrl, method } = req;
  const parsedUrl = new URL(rawUrl, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // GET: /api/medical-records/patient/:id
  const patientMatch = pathname.match(/^\/api\/medical-records\/patient\/(\d+)$/);
  if (method === 'GET' && patientMatch) {
    const patientId = patientMatch[1];
    return handleGetMedicalRecordsByPatientId(req, res, patientId);
  }

  // POST: /api/medical-records
  if (method === 'POST' && pathname === '/api/medical-records') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body);
        handleCreateMedicalRecord(req, res, parsedBody);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
      }
    });
    return;
  }

  // GET: /api/medical-records/search?name=...&date=...
  if (method === 'GET' && pathname === '/api/medical-records/search') {
    const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());
    return handleSearchMedicalRecords(req, res, queryParams);
  }

  // Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Medical record route not found' }));
}
