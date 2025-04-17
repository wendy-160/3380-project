import db from '../db.js';
import { URL } from 'url';

export async function handleTestRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const sendJson = (res, statusCode, data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
  };

  if (method === 'GET' && pathname === '/api/tests') {
    try {
      const [rows] = await db.query(`
        SELECT 
          t.*, 
          CONCAT(p.FirstName, ' ', p.LastName) AS PatientName 
        FROM medicaltest t
        JOIN patient p ON t.PatientID = p.PatientID
      `);
      return sendJson(res, 200, rows);
    } catch (err) {
      console.error('Error fetching tests:', err.message);
      return sendJson(res, 500, { message: 'Error fetching tests' });
    }
  }

  if (method === 'POST' && pathname === '/api/tests') {
    let rawData = '';
    req.on('data', chunk => rawData += chunk);
    req.on('end', async () => {
      try {
        const body = JSON.parse(rawData);
        const {
          patient_id,
          doctor_id,
          appointment_id,
          office_id,
          testName,
          testType,
          testDate,
          notes
        } = body;

        if (!patient_id || !doctor_id || !office_id || !testName || !testType || !testDate) {
          return sendJson(res, 400, { message: 'Missing required fields' });
        }

        await db.query(`
          INSERT INTO medicaltest (
            PatientID, DoctorID, AppointmentID,
            OfficeID, TestName, TestType,
            TestDate, Notes, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Ordered')
        `, [
          patient_id,
          doctor_id,
          appointment_id || null,
          office_id,
          testName,
          testType,
          testDate,
          notes || null
        ]);

        return sendJson(res, 201, { message: 'Test ordered successfully' });
        } catch (err) {
        console.error('Error ordering test:', err.message);
        return sendJson(res, 500, { message: 'Error ordering test' });
        }
        });
        return;
    }

  if (method === 'PUT' && pathname.startsWith('/api/tests/')) {
    const testID = pathname.split('/').pop();

    let body = req.body;
  
    if (!body) {
    let rawData = '';
    req.on('data', chunk => rawData += chunk);
    req.on('end', async () => {
      try {
          body = JSON.parse(rawData);
          console.log(`Parsed body for PUT /api/tests/${testID}:`, body);
  
        const { results, notes } = body;

          const [result] = await db.query(
            `UPDATE medicaltest
          SET Results = ?, Notes = ?, ResultDate = CURDATE(), status = 'Results Available'
             WHERE TestID = ?`,
            [results, notes || null, testID]
          );
  
          console.log('🔧 Update result:', result);
          return sendJson(res, 200, { message: 'Test updated successfully', result });
  
        } catch (err) {
          console.error('Failed to update test:', err.message);
          return sendJson(res, 500, { message: 'Update failed', error: err.message });
        }
        });
        return;
  }

    try {
      const { results, notes } = body;
  
      const [result] = await db.query(
        `UPDATE medicaltest
         SET Results = ?, Notes = ?, ResultDate = CURDATE(), status = 'Results Available'
         WHERE TestID = ?`,
        [results, notes || null, testID]
      );
  
      console.log('🔧 Update result:', result);
      return sendJson(res, 200, { message: 'Test updated successfully', result });
  
    } catch (err) {
      console.error('Failed to update test:', err.message);
      return sendJson(res, 500, { message: 'Update failed', error: err.message });
    }
  }
  

  return sendJson(res, 404, { message: 'Test route not found' });
}