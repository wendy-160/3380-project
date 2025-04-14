import db from '../db.js';

export async function getAllDoctorOffices(req, res) {
  try {
    console.log('Executing getAllDoctorOffices function');
    
    const [tables] = await db.query('SHOW TABLES LIKE "doctor_office"');
    if (tables.length === 0) {
      console.log('doctor_office table does not exist');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([]));
    }
    
    const [rows] = await db.query(`
      SELECT * FROM doctor_office
    `);
    
    console.log(`Found ${rows.length} doctor-office assignments`);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
    return true;
  } catch (err) {
    console.error('Error in getAllDoctorOffices:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
    return true;
  }
}

export async function getDoctorOfficesByOffice(req, res) {
  try {
    const officeId = req.params.officeId;
    const [rows] = await db.query(`
      SELECT do.*, d.FirstName, d.LastName
      FROM doctor_office do
      JOIN doctor d ON do.DoctorID = d.DoctorID
      WHERE do.OfficeID = ?
    `, [officeId]);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (err) {
    console.error('Error fetching doctor offices by office:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function getDoctorOfficesByDoctor(req, res) {
  try {
    const doctorId = req.params.doctorId;
    const [rows] = await db.query(`
      SELECT do.*, o.OfficeName, o.Address
      FROM doctor_office do
      JOIN office o ON do.OfficeID = o.OfficeID
      WHERE do.DoctorID = ?
    `, [doctorId]);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(rows));
  } catch (err) {
    console.error('Error fetching doctor offices by doctor:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function createDoctorOffice(req, res) {
  try {
    const { DoctorID, OfficeID, WorkDays, WorkHours } = req.body;

    console.log('createDoctorOffice function received:', req.body);

    if (!DoctorID || !OfficeID) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'DoctorID and OfficeID are required' }));
    }

    const doctorIdInt = parseInt(DoctorID, 10);
    const officeIdInt = parseInt(OfficeID, 10);

    const [existing] = await db.query(`
      SELECT * FROM doctor_office
      WHERE DoctorID = ? AND OfficeID = ?
    `, [doctorIdInt, officeIdInt]);

    if (existing.length > 0) {
      console.log('🟡 Doctor already assigned to this office');

      await db.query(`
        UPDATE doctor_office
        SET WorkDays = ?, WorkHours = ?
        WHERE DoctorID = ? AND OfficeID = ?
      `, [WorkDays || null, WorkHours || null, doctorIdInt, officeIdInt]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Assignment updated' }));
    }

    // ✅ Insert new assignment
    const [result] = await db.query(`
      INSERT INTO doctor_office (DoctorID, OfficeID, WorkDays, WorkHours)
      VALUES (?, ?, ?, ?)
    `, [doctorIdInt, officeIdInt, WorkDays || null, WorkHours || null]);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Doctor assigned to office', id: result.insertId }));
  } catch (err) {
    console.error('❌ Error in createDoctorOffice:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}






export async function updateDoctorOffice(req, res) {
  try {
    const doctorId = req.params.doctorId;
    const officeId = req.params.officeId;
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { WorkDays, WorkHours } = JSON.parse(body);
        
        await db.query(`
          UPDATE doctor_office
          SET WorkDays = ?, WorkHours = ?
          WHERE DoctorID = ? AND OfficeID = ?
        `, [WorkDays, WorkHours, doctorId, officeId]);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          message: 'Doctor-office assignment updated successfully'
        }));
      } catch (err) {
        console.error('Error parsing request or updating data:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } catch (err) {
    console.error('Error updating doctor office:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

export async function deleteDoctorOffice(req, res) {
  try {
    const doctorId = req.params.doctorId;
    const officeId = req.params.officeId;
    
    await db.query(`
      DELETE FROM doctor_office
      WHERE DoctorID = ? AND OfficeID = ?
    `, [doctorId, officeId]);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Doctor-office assignment deleted successfully'
    }));
  } catch (err) {
    console.error('Error deleting doctor office:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}