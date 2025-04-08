import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = await mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: 'Thinhvu1108!', // put in your own MySQL password
  database: 'medicalclinicdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
