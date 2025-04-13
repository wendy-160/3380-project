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
        WHERE r.ReferringDoctorID = ? AND r.Status = 'Pending'
      `, [doctorID]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(rows));
      return;
    } catch (err) {
      console.error('❌ Error fetching pending referrals:', err.message, err);
      res.writeHead(500);
      res.end(JSON.stringify({ message: 'Failed to fetch referrals' }));
      return;
    }
  }

  if (method === 'POST' && pathname.startsWith('/api/referrals')) {
    console.log('🧠 Inside POST /api/referrals route');

    try {
      const { PatientID, SpecialistID, Reason, Notes, ReferredBy } = req.body;

      console.log('✅ Parsed referral from req.body:', {
        PatientID, SpecialistID, Reason, Notes, ReferredBy
      });

      if (!PatientID || !SpecialistID || !Reason || !ReferredBy) {
        console.warn('⚠️ Missing required fields');
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Missing required fields' }));
        return;
      }

      if (parseInt(SpecialistID) === parseInt(ReferredBy)) {
        console.warn('❌ Referring to self is not allowed');
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Cannot refer patient to yourself.' }));
        return;
      }

      const [result] = await db.execute(`
        INSERT INTO referral (PatientID, SpecialistDoctorID, Reason, Notes, ReferringDoctorID, Status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
      `, [PatientID, SpecialistID, Reason, Notes || '', ReferredBy]);

      console.log('✅ Referral inserted with ID:', result.insertId);

      const [pendingReferrals] = await db.execute(`
        SELECT r.ReferralId, r.PatientId, r.SpecialistDoctorId, r.Reason, r.Notes, r.Status,
               p.FirstName AS PatientName,
               s.FirstName AS SpecialistName, s.Specialization AS Specialty
        FROM referral r
        JOIN patient p ON r.PatientId = p.PatientID
        JOIN doctor s ON r.SpecialistDoctorId = s.DoctorID
        WHERE r.ReferringDoctorID = ? AND r.Status = 'Pending'
      `, [ReferredBy]);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Referral created successfully',
        ReferralID: result.insertId,
        updatedPendingReferrals: pendingReferrals
      }));
    } catch (err) {
      console.error('❌ Error inserting referral:', err.message, err);
      res.writeHead(500);
      res.end(JSON.stringify({ message: 'Failed to create referral' }));
    }
    return;
  }

  const matchApprove = pathname.match(/^\/api\/referrals\/(\d+)\/approve$/);
  if (method === 'PUT' && matchApprove) {
    const referralID = matchApprove[1];

    try {
      await db.execute(
        `UPDATE referral SET Status = 'Approved' WHERE ReferralID = ?`,
        [referralID]
      );
      console.log(`✅ Referral ${referralID} approved`);
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Referral approved' }));
    } catch (err) {
      console.error('❌ Error approving referral:', err.message, err);
      res.writeHead(500);
      res.end(JSON.stringify({ message: 'Failed to approve referral' }));
    }
    return;
  }

  const matchReject = pathname.match(/^\/api\/referrals\/(\d+)\/reject$/);
  if (method === 'PUT' && matchReject) {
    const referralID = matchReject[1];

    try {
      await db.execute(
        `UPDATE referral SET Status = 'Rejected' WHERE ReferralID = ?`,
        [referralID]
      );
      console.log(`❌ Referral ${referralID} rejected`);
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Referral rejected' }));
    } catch (err) {
      console.error('❌ Error rejecting referral:', err.message, err);
      res.writeHead(500);
      res.end(JSON.stringify({ message: 'Failed to reject referral' }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Referral route not found' }));
}
