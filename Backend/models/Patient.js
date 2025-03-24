const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Define model that maps to existing table
const Patient = sequelize.define('Patient', {
  PatientID: {  
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: true
  },
  FirstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  LastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  MRN: {
    type: DataTypes.CHAR,
    allowNull: true
  },
  Ethnicity: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  Race: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  Gender: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  DOB: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  Address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  PhoneNumber: {
    type: DataTypes.CHAR,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },

}, {
  tableName: 'patient', 
  timestamps: false 
});

module.exports = Patient;

//you do this for all tables i believe doctor, appointments, office, etc
