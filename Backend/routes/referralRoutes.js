import db from '../db.js';
import { URL } from 'url';

export async function handleReferralRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const matchPending = pathname.match(/^\/api\/referrals\/pending\/doctor\/(\d+)$/);
  if (method === 'GET' && matchPending) {
    const doctorID = matchPending[1];

    try {
      const [rows] = await db.execute(`
        SELECT r.ReferralId, r.PatientId, r.SpecialistDoctorId, r.Reason, r.Notes, r.Status,
               p.FirstName AS PatientName,
               s.FirstName AS SpecialistName, s.Specialization AS Specialty
        FROM referral r
        JOIN patient p ON r.PatientId = p.PatientID
        JOIN doctor s ON r.SpecialistDoctorId = s.DoctorID
        WHERE r.ReferringDoctorId = ? AND r.Status = 'Pending'
      `, [doctorID]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows));
      return;
    } catch (err) {
      console.error('Error fetching pending referrals:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Failed to fetch referrals' }));
      return;
    }
  }

  if (method === 'POST' && pathname === '/api/referrals') {
    const { PatientID, SpecialistID, Reason, Notes, ReferredBy } = req.body;

    if (!PatientID || !SpecialistID || !Reason || !ReferredBy) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Missing required fields' }));
      return;
    }

    try {
      const [result] = await db.execute(`
        INSERT INTO referral (PatientId, SpecialistDoctorId, Reason, Notes, ReferringDoctorId)
        VALUES (?, ?, ?, ?, ?)
      `, [PatientID, SpecialistID, Reason, Notes, ReferredBy]);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Referral created', ReferralID: result.insertId }));
      return;
    } catch (err) {
      console.error('Error creating referral:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Failed to create referral' }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Referral route not found' }));
}
