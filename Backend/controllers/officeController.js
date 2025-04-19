import db from '../db.js';

export async function getAllOffices(req, res) {
    try {
        const [rows] = await db.query(`SELECT * FROM office`);
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(rows));
        return true;
    } catch (err) {
        console.error('Database error:', err);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'error',
            message: 'Failed to fetch office locations',
            error: err.message 
        }));
        return true;
    }
}

export async function getOfficesByState(req, res) {
    try {
        const state = req.params.state;
        const [rows] = await db.query('SELECT * FROM office WHERE State = ?', [state]);
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(rows));
        return true;
    } catch (err) {
        console.error('Database error:', err);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'error',
            message: 'Failed to fetch offices by state',
            error: err.message 
        }));
        return true;
    }
}

export async function getOfficeById(req, res) {
    try {
        const id = req.params.id;
        const [rows] = await db.query(`SELECT * FROM office WHERE OfficeID = ?`, [id]);
        
        if (rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'error',
                message: 'Office not found' 
            }));
            return true;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows[0]));
        return true;
    } catch (err) {
        console.error('Database error:', err);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'error',
            message: 'Failed to fetch office by ID',
            error: err.message 
        }));
        return true;
    }
}

export async function createOffice(req, res) {
    try {
        const requiredFields = ['OfficeName', 'PhoneNumber', 'Address', 'City', 'State', 'ZipCode' ];
        
        for (const field of requiredFields) {
            if (!req.body[field]) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'error',
                    message: `Missing required field: ${field}` 
                }));
                return true;
            }
        }
        
        const { 
            OfficeName, 
            PhoneNumber,
            Address, 
            City, 
            State, 
            ZipCode, 
            Email = null,
            OperatingHours = null 
        } = req.body;
        
        const query = `
            INSERT INTO office 
            (OfficeName, PhoneNumber, Address, City, State, ZipCode, Email, OperatingHours) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [
            OfficeName, 
            PhoneNumber,
            Address, 
            City, 
            State, 
            ZipCode, 
            Email,
            OperatingHours
        ]);
        
        if (result.affectedRows === 0) {
            throw new Error('Failed to create office');
        }
        
        const [newOffice] = await db.query(
            `SELECT * FROM office WHERE OfficeID = ?`, 
            [result.insertId]
        );
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'success',
            message: 'Office created successfully',
            data: newOffice[0]
        }));
        return true;
    } catch (err) {
        console.error('Database error:', err);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'error',
            message: 'Failed to create office',
            error: err.message 
        }));
        return true;
    }
}

export async function updateOffice(req, res) {
    try {
        const id = req.params.id;
        
        const [checkResult] = await db.query(
            `SELECT OfficeID FROM office WHERE OfficeID = ?`, 
            [id]
        );
        
        if (checkResult.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'error',
                message: 'Office not found' 
            }));
            return true;
        }
        
        const requiredFields = ['OfficeName', 'PhoneNumber', 'Address', 'City', 'State', 'ZipCode'];
        
        for (const field of requiredFields) {
            if (!req.body[field]) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'error',
                    message: `Missing required field: ${field}` 
                }));
                return true;
            }
        }
        
        const { 
            OfficeName, 
            PhoneNumber,
            Address, 
            City, 
            State, 
            ZipCode, 
            Email = null, 
            OperatingHours = null
        } = req.body;
        
        const query = `
            UPDATE office SET
            OfficeName = ?,
            PhoneNumber = ?,
            Address = ?,
            City = ?,
            State = ?,
            ZipCode = ?,
            Email = ?,
            OperatingHours = ?
            WHERE OfficeID = ?
        `;
        
        const [result] = await db.query(query, [
            OfficeName, 
            PhoneNumber,
            Address, 
            City, 
            State, 
            ZipCode, 
            Email, 
            OperatingHours,
            id  
        ]);
        
        if (result.affectedRows === 0) {
            throw new Error('Failed to update office');
        }
        
        const [updatedOffice] = await db.query(
            `SELECT * FROM office WHERE OfficeID = ?`, 
            [id]
        );
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'success',
            message: 'Office updated successfully',
            data: updatedOffice[0]
        }));
        return true;
    } catch (err) {
        console.error('Database error:', err);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'error',
            message: 'Failed to update office',
            error: err.message 
        }));
        return true;
    }
}

export async function deleteOffice(req, res) {
    try {
        const id = req.params.id;
        

        const [checkResult] = await db.query(
            `SELECT OfficeID FROM office WHERE OfficeID = ?`, 
            [id]
        );
        
        if (checkResult.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                status: 'error',
                message: 'Office not found' 
            }));
            return true;
        }
        
        const [result] = await db.query(
            `DELETE FROM office WHERE OfficeID = ?`, 
            [id]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Failed to delete office');
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'success',
            message: 'Office deleted successfully'
        }));
        return true;
    } catch (err) {
        console.error('Database error:', err);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'error',
            message: 'Failed to delete office',
            error: err.message 
        }));
        return true;
    }
}

