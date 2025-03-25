import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = await mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: '1722AutumnLeaves!', 
  database: 'medicalclinic',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;