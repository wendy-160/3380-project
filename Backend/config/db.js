const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // MySQL username
  password: '1722AutumnLeaves!', //  MySQL password
  database: 'medicalclinic'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('✅ Connected to MySQL Database');
    }
});

export default db;