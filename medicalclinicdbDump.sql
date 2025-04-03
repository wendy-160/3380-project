-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: medicalclinicdb
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `AppointmentID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `OfficeID` int NOT NULL,
  `DateTime` datetime NOT NULL,
  `status` enum('Scheduled','Completed','Canceled') DEFAULT NULL,
  `Reason` text,
  `ScheduledVia` enum('Phone','WebPortal') DEFAULT NULL,
  `Notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`AppointmentID`),
  UNIQUE KEY `unique_doctor_time` (`DoctorID`,`DateTime`),
  KEY `PatientID` (`PatientID`),
  KEY `OfficeID` (`OfficeID`),
  KEY `idx_appointments_datetime` (`DateTime`),
  KEY `idx_appointments_status` (`status`),
  CONSTRAINT `appointment_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorId`) ON DELETE CASCADE,
  CONSTRAINT `appointment_ibfk_3` FOREIGN KEY (`OfficeID`) REFERENCES `office` (`OfficeId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing`
--

DROP TABLE IF EXISTS `billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing` (
  `BillingId` int NOT NULL AUTO_INCREMENT,
  `PatientId` int NOT NULL,
  `AppointmentId` int DEFAULT NULL,
  `PrescriptionId` int DEFAULT NULL,
  `TestId` int DEFAULT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentStatus` enum('Pending','Paid','Partially Paid','Insurance Pending','Overdue','Cancelled') NOT NULL DEFAULT 'Pending',
  `BillingDate` date NOT NULL DEFAULT (curdate()),
  `PaymentMethod` varchar(50) DEFAULT NULL,
  `PaymentDate` date DEFAULT NULL,
  `Notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`BillingId`),
  KEY `PatientId` (`PatientId`),
  KEY `AppointmentId` (`AppointmentId`),
  KEY `PrescriptionId` (`PrescriptionId`),
  KEY `TestId` (`TestId`),
  CONSTRAINT `billing_ibfk_1` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `billing_ibfk_2` FOREIGN KEY (`AppointmentId`) REFERENCES `appointment` (`AppointmentID`) ON DELETE SET NULL,
  CONSTRAINT `billing_ibfk_3` FOREIGN KEY (`PrescriptionId`) REFERENCES `prescription` (`PrescriptionID`) ON DELETE SET NULL,
  CONSTRAINT `billing_ibfk_4` FOREIGN KEY (`TestId`) REFERENCES `medicaltest` (`TestId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing`
--

LOCK TABLES `billing` WRITE;
/*!40000 ALTER TABLE `billing` DISABLE KEYS */;
/*!40000 ALTER TABLE `billing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `DoctorId` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Specialization` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`DoctorId`),
  UNIQUE KEY `UserID` (`UserID`),
  CONSTRAINT `doctor_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `login` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_office`
--

DROP TABLE IF EXISTS `doctor_office`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor_office` (
  `DoctorID` int NOT NULL,
  `OfficeID` int NOT NULL,
  `WorkDays` varchar(100) NOT NULL,
  `WorkHours` text,
  PRIMARY KEY (`DoctorID`,`OfficeID`),
  KEY `OfficeID` (`OfficeID`),
  CONSTRAINT `doctor_office_ibfk_1` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorId`) ON DELETE CASCADE,
  CONSTRAINT `doctor_office_ibfk_2` FOREIGN KEY (`OfficeID`) REFERENCES `office` (`OfficeId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_office`
--

LOCK TABLES `doctor_office` WRITE;
/*!40000 ALTER TABLE `doctor_office` DISABLE KEYS */;
/*!40000 ALTER TABLE `doctor_office` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('Patient','Doctor','Admin') NOT NULL DEFAULT 'Patient',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'Admin User','$2a$12$5uIVdBHtUAViTR.AQuv05efo1yQbiTjq8hyubTOtEPKkGRwSTWihS','admin@example.com','Admin'),(2,'Dr. Smith','$2a$12$57Yi.kgGxDQDoyeVZZwfnOp8GSb9JdUntsXYhULs8Rkf4I8unOYQ2','doctor@example.com','Doctor'),(3,'John.Doe123','$2b$10$HNDTzd2okXopdKnBJPHnwOClOnjRsVyNfHdWG3hMicTAN6cY9KhrG','john.doe@example.com','Patient');
/*!40000 ALTER TABLE `login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicalrecord`
--

DROP TABLE IF EXISTS `medicalrecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicalrecord` (
  `MedicalRecordID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int NOT NULL,
  `AppointmentID` int DEFAULT NULL,
  `DoctorID` int NOT NULL,
  `VisitDate` date NOT NULL,
  `Diagnosis` text,
  `TreatmentPlan` text,
  `Notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`MedicalRecordID`),
  KEY `PatientID` (`PatientID`),
  KEY `AppointmentID` (`AppointmentID`),
  KEY `DoctorID` (`DoctorID`),
  CONSTRAINT `medicalrecord_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `medicalrecord_ibfk_2` FOREIGN KEY (`AppointmentID`) REFERENCES `appointment` (`AppointmentID`) ON DELETE SET NULL,
  CONSTRAINT `medicalrecord_ibfk_3` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalrecord`
--

LOCK TABLES `medicalrecord` WRITE;
/*!40000 ALTER TABLE `medicalrecord` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicalrecord` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicaltest`
--

DROP TABLE IF EXISTS `medicaltest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicaltest` (
  `TestId` int NOT NULL AUTO_INCREMENT,
  `PatientId` int NOT NULL,
  `DoctorId` int NOT NULL,
  `AppointmentId` int DEFAULT NULL,
  `OfficeId` int NOT NULL,
  `TestName` varchar(100) NOT NULL,
  `TestType` varchar(50) NOT NULL,
  `TestDate` date DEFAULT NULL,
  `status` enum('Ordered','Scheduled','Completed','Cancelled','Results Available') NOT NULL DEFAULT 'Ordered',
  `Results` text,
  `ResultDate` date DEFAULT NULL,
  `Notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TestId`),
  KEY `PatientId` (`PatientId`),
  KEY `DoctorId` (`DoctorId`),
  KEY `AppointmentId` (`AppointmentId`),
  KEY `OfficeId` (`OfficeId`),
  CONSTRAINT `medicaltest_ibfk_1` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `medicaltest_ibfk_2` FOREIGN KEY (`DoctorId`) REFERENCES `doctor` (`DoctorId`) ON DELETE CASCADE,
  CONSTRAINT `medicaltest_ibfk_3` FOREIGN KEY (`AppointmentId`) REFERENCES `appointment` (`AppointmentID`) ON DELETE SET NULL,
  CONSTRAINT `medicaltest_ibfk_4` FOREIGN KEY (`OfficeId`) REFERENCES `office` (`OfficeId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicaltest`
--

LOCK TABLES `medicaltest` WRITE;
/*!40000 ALTER TABLE `medicaltest` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicaltest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `office`
--

DROP TABLE IF EXISTS `office`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `office` (
  `OfficeId` int NOT NULL AUTO_INCREMENT,
  `OfficeName` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `Address` text NOT NULL,
  `City` varchar(50) NOT NULL,
  `State` varchar(30) NOT NULL,
  `ZipCode` varchar(10) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `OperatingHours` text NOT NULL,
  PRIMARY KEY (`OfficeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `office`
--

LOCK TABLES `office` WRITE;
/*!40000 ALTER TABLE `office` DISABLE KEYS */;
/*!40000 ALTER TABLE `office` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `PatientID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `DOB` date NOT NULL,
  `Gender` enum('Male','Female','Other') NOT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `Address` text,
  `City` varchar(50) DEFAULT NULL,
  `State` varchar(30) DEFAULT NULL,
  `Zipcode` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`PatientID`),
  UNIQUE KEY `UserID` (`UserID`),
  CONSTRAINT `patient_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `login` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_doctor_assignment`
--

DROP TABLE IF EXISTS `patient_doctor_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_doctor_assignment` (
  `PatientID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `AssignmentDate` date NOT NULL DEFAULT (curdate()),
  `PrimaryPhysicianFlag` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`PatientID`,`DoctorID`),
  KEY `DoctorID` (`DoctorID`),
  CONSTRAINT `patient_doctor_assignment_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `patient_doctor_assignment_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_doctor_assignment`
--

LOCK TABLES `patient_doctor_assignment` WRITE;
/*!40000 ALTER TABLE `patient_doctor_assignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_doctor_assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `PrescriptionID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `AppointmentID` int DEFAULT NULL,
  `MedicationMame` varchar(100) NOT NULL,
  `Dosage` varchar(50) NOT NULL,
  `Frequency` varchar(100) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date DEFAULT NULL,
  `Notes` text,
  `status` enum('Active','Completed') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PrescriptionID`),
  KEY `PatientID` (`PatientID`),
  KEY `DoctorID` (`DoctorID`),
  KEY `AppointmentID` (`AppointmentID`),
  CONSTRAINT `prescription_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `prescription_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorId`) ON DELETE CASCADE,
  CONSTRAINT `prescription_ibfk_3` FOREIGN KEY (`AppointmentID`) REFERENCES `appointment` (`AppointmentID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `referral`
--

DROP TABLE IF EXISTS `referral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referral` (
  `ReferralId` int NOT NULL AUTO_INCREMENT,
  `ReferringDoctorId` int NOT NULL,
  `PatientId` int NOT NULL,
  `SpecialistDoctorId` int NOT NULL,
  `Date` date NOT NULL DEFAULT (curdate()),
  `Reason` text NOT NULL,
  `Status` enum('Pending','Approved','Rejected','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `Notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReferralId`),
  KEY `ReferringDoctorId` (`ReferringDoctorId`),
  KEY `PatientId` (`PatientId`),
  KEY `SpecialistDoctorId` (`SpecialistDoctorId`),
  CONSTRAINT `referral_ibfk_1` FOREIGN KEY (`ReferringDoctorId`) REFERENCES `doctor` (`DoctorId`) ON DELETE CASCADE,
  CONSTRAINT `referral_ibfk_2` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `referral_ibfk_3` FOREIGN KEY (`SpecialistDoctorId`) REFERENCES `doctor` (`DoctorId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referral`
--

LOCK TABLES `referral` WRITE;
/*!40000 ALTER TABLE `referral` DISABLE KEYS */;
/*!40000 ALTER TABLE `referral` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-02 21:08:33
