import db from '../db.js';

export async function getAllDoctorOffices(req, res) {
  try {
    console.log('Executing getAllDoctorOffices function');
    
    // Check if the doctor_office table exists
    const [tables] = await db.query('SHOW TABLES LIKE "doctor_office"');
    if (tables.length === 0) {
      console.log('doctor_office table does not exist');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([]));
    }
    
    // Query the database
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
  console.log('createDoctorOffice function called');
  console.log('Headers:', req.headers);
  
  // Initialize an empty body
  let body = '';
  
  // Collect request data chunks
  req.on('data', chunk => {
    body += chunk.toString();
    console.log('Received chunk:', chunk.toString());
  });
  
  // Process the complete data when the request ends
  req.on('end', async () => {
    try {
      console.log('Request ended, processing data');
      console.log('Full request body:', body);
      
      if (!body || body.trim() === '') {
        console.error('Empty request body');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Empty request body' }));
      }
      
      // Parse the JSON body
      let parsedData;
      try {
        parsedData = JSON.parse(body);
        console.log('Successfully parsed JSON:', parsedData);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid JSON format' }));
      }
      
      const { DoctorID, OfficeID, WorkDays, WorkHours } = parsedData;
      console.log('Extracted data:', { DoctorID, OfficeID, WorkDays, WorkHours });
      
      // Validate required fields
      if (!DoctorID || !OfficeID) {
        console.error('Missing required fields');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'DoctorID and OfficeID are required' }));
      }
      
      // Ensure IDs are integers
      const doctorIdInt = parseInt(DoctorID, 10);
      const officeIdInt = parseInt(OfficeID, 10);
      
      if (isNaN(doctorIdInt) || isNaN(officeIdInt)) {
        console.error('Invalid ID format');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'DoctorID and OfficeID must be valid integers' }));
      }
      
      console.log('Attempting database insertion...');
      try {
        // Insert into database
        const [result] = await db.query(`
          INSERT INTO doctor_office (DoctorID, OfficeID, WorkDays, WorkHours)
          VALUES (?, ?, ?, ?)
        `, [doctorIdInt, officeIdInt, WorkDays || null, WorkHours || null]);
        
        console.log('Database insertion successful:', result);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          message: 'Doctor-office assignment created successfully',
          id: result.insertId
        }));
      } catch (dbError) {
        console.error('Database error:', dbError);
        
        // Check for duplicate entry error
        if (dbError.code === 'ER_DUP_ENTRY') {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'This doctor is already assigned to this clinic' 
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: dbError.message }));
        }
      }
    } catch (err) {
      console.error('Error in end handler:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error: ' + err.message }));
    }
  });
  
  // Handle request errors
  req.on('error', (err) => {
    console.error('Request error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Request error: ' + err.message }));
  });
}


export async function updateDoctorOffice(req, res) {
  try {
    const doctorId = req.params.doctorId;
    const officeId = req.params.officeId;
    
    // Get the request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { WorkDays, WorkHours } = JSON.parse(body);
        
        // Update in database
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
    
    // Delete from database
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