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
  CONSTRAINT `appointment_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorID`) ON DELETE CASCADE,
  CONSTRAINT `appointment_ibfk_3` FOREIGN KEY (`OfficeID`) REFERENCES `office` (`OfficeID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,1,1,1,'2025-01-20 10:00:00','Completed','Annual Checkup','WebPortal','Regular checkup','2024-12-20 14:00:00','2025-04-09 14:45:02'),(2,1,2,1,'2025-01-31 12:00:00','Scheduled','Heart palpitations','WebPortal','Referred by Dr.Smith','2025-01-20 17:00:00','2025-04-09 14:03:24');
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing`
--

DROP TABLE IF EXISTS `billing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing` (
  `BillingID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int NOT NULL,
  `AppointmentID` int DEFAULT NULL,
  `PrescriptionID` int DEFAULT NULL,
  `TestID` int DEFAULT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentStatus` enum('Pending','Paid','Partially Paid','Insurance Pending','Overdue','Cancelled') NOT NULL DEFAULT 'Pending',
  `BillingDate` date NOT NULL DEFAULT (curdate()),
  `PaymentMethod` varchar(50) DEFAULT NULL,
  `PaymentDate` date DEFAULT NULL,
  `Notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`BillingID`),
  KEY `billing_ibfk_1` (`PatientID`),
  KEY `billing_ibfk_2` (`AppointmentID`),
  KEY `billing_ibfk_3` (`PrescriptionID`),
  KEY `billing_ibfk_4` (`TestID`),
  CONSTRAINT `billing_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `billing_ibfk_2` FOREIGN KEY (`AppointmentID`) REFERENCES `appointment` (`AppointmentID`) ON DELETE SET NULL,
  CONSTRAINT `billing_ibfk_3` FOREIGN KEY (`PrescriptionID`) REFERENCES `prescription` (`PrescriptionID`) ON DELETE SET NULL,
  CONSTRAINT `billing_ibfk_4` FOREIGN KEY (`TestID`) REFERENCES `medicaltest` (`TestID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing`
--

LOCK TABLES `billing` WRITE;
/*!40000 ALTER TABLE `billing` DISABLE KEYS */;
INSERT INTO `billing` VALUES (1,1,1,NULL,1,250.00,'Paid','2025-01-20','Credit Card','2025-01-20',NULL,'2025-04-09 15:45:56','2025-04-09 15:45:56'),(2,1,2,1,3,350.00,'Paid','2025-01-31','Insurance','2025-02-15',NULL,'2025-04-09 15:45:56','2025-04-09 15:45:56');
/*!40000 ALTER TABLE `billing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `DoctorID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `Specialization` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`DoctorID`),
  UNIQUE KEY `UserID` (`UserID`),
  CONSTRAINT `doctor_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `login` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES (1,2,'Aaron','Smith','Primary Care Physician','111-222-3333'),(2,4,'Christina','Yang','Cardiologist','555-111-2222');
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
  CONSTRAINT `doctor_office_ibfk_1` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorID`) ON DELETE CASCADE,
  CONSTRAINT `doctor_office_ibfk_2` FOREIGN KEY (`OfficeID`) REFERENCES `office` (`OfficeID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_office`
--

LOCK TABLES `doctor_office` WRITE;
/*!40000 ALTER TABLE `doctor_office` DISABLE KEYS */;
INSERT INTO `doctor_office` VALUES (1,2,'Mon, Tue, Wed','9:00-17:00'),(1,3,'Thu, Fri','9:00-17:00'),(2,1,'Mon, Wed, Fri','8:00-16:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'Admin User','$2a$12$5uIVdBHtUAViTR.AQuv05efo1yQbiTjq8hyubTOtEPKkGRwSTWihS','admin@example.com','Admin'),(2,'Dr. Smith','$2a$12$57Yi.kgGxDQDoyeVZZwfnOp8GSb9JdUntsXYhULs8Rkf4I8unOYQ2','doctor@example.com','Doctor'),(3,'John.Doe123','$2b$10$HNDTzd2okXopdKnBJPHnwOClOnjRsVyNfHdWG3hMicTAN6cY9KhrG','john.doe@example.com','Patient'),(4,'Dr.Yang','$2a$12$ylUFDdssVKu..2nIrAm/CuoHV3hf5jpPpPC0.ObTzpUN0By5la6De','yang.heart@example.com','Doctor');
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
  CONSTRAINT `medicalrecord_ibfk_3` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalrecord`
--

LOCK TABLES `medicalrecord` WRITE;
/*!40000 ALTER TABLE `medicalrecord` DISABLE KEYS */;
INSERT INTO `medicalrecord` VALUES (1,1,1,1,'2025-01-20','Overall Healthy, heart palpitations, slightly elevated blood pressure ','Monitor blood pressure, diet and exercise recommendations','Referral made with cardiologist','2025-01-20 14:00:00','2025-04-09 15:08:57'),(2,1,2,2,'2025-01-31','Mild arrhythmia','Prescribed metoprolol 25mg daily','ECG shows mild irregularities','2025-01-31 18:00:00','2025-04-09 15:08:57');
/*!40000 ALTER TABLE `medicalrecord` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicaltest`
--

DROP TABLE IF EXISTS `medicaltest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicaltest` (
  `TestID` int NOT NULL AUTO_INCREMENT,
  `PatientID` int NOT NULL,
  `DoctorID` int NOT NULL,
  `AppointmentID` int DEFAULT NULL,
  `OfficeID` int NOT NULL,
  `TestName` varchar(100) NOT NULL,
  `TestType` varchar(50) NOT NULL,
  `TestDate` date DEFAULT NULL,
  `status` enum('Ordered','Scheduled','Completed','Cancelled','Results Available') NOT NULL DEFAULT 'Ordered',
  `Results` text,
  `ResultDate` date DEFAULT NULL,
  `Notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TestID`),
  KEY `medicaltest_ibfk_1` (`PatientID`),
  KEY `medicaltest_ibfk_2` (`DoctorID`),
  KEY `medicaltest_ibfk_3` (`AppointmentID`),
  KEY `medicaltest_ibfk_4` (`OfficeID`),
  CONSTRAINT `medicaltest_ibfk_1` FOREIGN KEY (`PatientID`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `medicaltest_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorID`) ON DELETE CASCADE,
  CONSTRAINT `medicaltest_ibfk_3` FOREIGN KEY (`AppointmentID`) REFERENCES `appointment` (`AppointmentID`) ON DELETE SET NULL,
  CONSTRAINT `medicaltest_ibfk_4` FOREIGN KEY (`OfficeID`) REFERENCES `office` (`OfficeID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicaltest`
--

LOCK TABLES `medicaltest` WRITE;
/*!40000 ALTER TABLE `medicaltest` DISABLE KEYS */;
INSERT INTO `medicaltest` VALUES (1,1,1,1,1,'Complete Blood Count','Laboratory','2025-01-20','Results Available','Within normal limits','2025-01-20',NULL,'2025-04-09 15:24:06','2025-04-09 15:24:06'),(2,1,1,1,1,'Lipid Panel','Laboratory','2025-01-20','Results Available','Elevated LDL: 145, HDL: 45, Total: 220','2025-01-20',NULL,'2025-04-09 15:24:06','2025-04-09 15:24:06'),(3,1,2,2,1,'ECG','Cardiology','2025-01-31','Results Available','Mild arrhythmia detected','2025-01-31',NULL,'2025-04-09 15:24:06','2025-04-09 15:24:06');
/*!40000 ALTER TABLE `medicaltest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `office`
--

DROP TABLE IF EXISTS `office`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `office` (
  `OfficeID` int NOT NULL AUTO_INCREMENT,
  `OfficeName` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `Address` text NOT NULL,
  `City` varchar(50) NOT NULL,
  `State` varchar(30) NOT NULL,
  `ZipCode` varchar(10) NOT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `OperatingHours` text NOT NULL,
  PRIMARY KEY (`OfficeID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `office`
--

LOCK TABLES `office` WRITE;
/*!40000 ALTER TABLE `office` DISABLE KEYS */;
INSERT INTO `office` VALUES (1,'Medical Center','111-111-1111','123 Main st','Houston','TX','77803','medi.center@example.com','Mon-Fri: 8:00-18:00'),(2,'Community Clinic','222-222-2222','124 Blake St','Houston','TX','77502','comm.clinic@example.com','Mon-Fri:8:00-17:00, Sat: 9:00-13:00'),(3,'UH Clinic','333-333-3333','4349 Martin Luther King Blvd','Houston','TX','77204','UHClinic@example.com','Mon-Fri: 8:00-18:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,3,'John','Doe','1969-12-29','Male','555-555-5555','321 Hillbrook Dr ','Houston','TX','77070');
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
  CONSTRAINT `patient_doctor_assignment_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_doctor_assignment`
--

LOCK TABLES `patient_doctor_assignment` WRITE;
/*!40000 ALTER TABLE `patient_doctor_assignment` DISABLE KEYS */;
INSERT INTO `patient_doctor_assignment` VALUES (1,1,'2024-04-04',1);
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
  `MedicationName` varchar(100) NOT NULL,
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
  CONSTRAINT `prescription_ibfk_2` FOREIGN KEY (`DoctorID`) REFERENCES `doctor` (`DoctorID`) ON DELETE CASCADE,
  CONSTRAINT `prescription_ibfk_3` FOREIGN KEY (`AppointmentID`) REFERENCES `appointment` (`AppointmentID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES (1,1,2,2,'Metoprolol','25mg','Once daily','2025-01-31','2025-03-31','Take in the morning with food','Completed','2025-04-09 15:16:41');
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `referral`
--

DROP TABLE IF EXISTS `referral`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referral` (
  `ReferralID` int NOT NULL AUTO_INCREMENT,
  `ReferringDoctorID` int NOT NULL,
  `PatientID` int NOT NULL,
  `SpecialistDoctorID` int NOT NULL,
  `Date` date NOT NULL DEFAULT (curdate()),
  `Reason` text NOT NULL,
  `Status` enum('Pending','Approved','Rejected','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `Notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReferralID`),
  KEY `referral_ibfk_1` (`ReferringDoctorID`),
  KEY `referral_ibfk_2` (`PatientID`),
  KEY `referral_ibfk_3` (`SpecialistDoctorID`),
  CONSTRAINT `referral_ibfk_1` FOREIGN KEY (`ReferringDoctorID`) REFERENCES `doctor` (`DoctorID`) ON DELETE CASCADE,
  CONSTRAINT `referral_ibfk_2` FOREIGN KEY (`PatientID`) REFERENCES `patient` (`PatientID`) ON DELETE CASCADE,
  CONSTRAINT `referral_ibfk_3` FOREIGN KEY (`SpecialistDoctorID`) REFERENCES `doctor` (`DoctorID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referral`
--

LOCK TABLES `referral` WRITE;
/*!40000 ALTER TABLE `referral` DISABLE KEYS */;
INSERT INTO `referral` VALUES (1,1,1,2,'2025-01-31','Heart palpitations requiring cardiology assessment','Completed','Patient reporting occasional rapid heartbeat','2025-04-09 15:35:29','2025-04-09 15:35:29');
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

-- Dump completed on 2025-04-09 10:56:26
