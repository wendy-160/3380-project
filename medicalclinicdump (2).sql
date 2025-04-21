-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: switchyard.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.2.0

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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
INSERT INTO `appointment` VALUES (1,1,1,1,'2025-01-20 10:00:00','Completed','Annual Checkup','WebPortal','Regular checkup','2024-12-20 14:00:00','2025-04-09 14:45:02'),(2,1,2,1,'2025-01-31 12:00:00','Scheduled','Heart palpitations','WebPortal','Referred by Dr.Smith','2025-01-20 17:00:00','2025-04-09 14:03:24'),(3,1,1,1,'2025-05-10 00:00:00','Scheduled','check-up','WebPortal',NULL,'2025-04-10 05:00:00','2025-04-10 20:02:54'),(4,1,1,1,'2025-04-11 17:00:00','Completed','Checkup','WebPortal','Regular checkup','2025-04-12 01:58:48','2025-04-20 16:25:26'),(8,1,1,3,'2025-05-23 14:30:00','Scheduled','test',NULL,NULL,'2025-04-20 03:07:40','2025-04-20 03:07:40'),(9,1,1,1,'2025-04-20 14:00:00','Completed','checkup-test',NULL,NULL,'2025-04-20 14:23:27','2025-04-20 16:46:32'),(10,1,1,2,'2025-04-22 15:30:00','Completed','test',NULL,NULL,'2025-04-20 14:26:25','2025-04-20 16:30:54'),(12,4,1,2,'2025-04-23 14:00:00','Completed','stomach pain',NULL,NULL,'2025-04-20 15:31:12','2025-04-20 20:20:19'),(13,5,1,1,'2025-04-20 13:30:00','Completed','Sick ',NULL,NULL,'2025-04-20 16:57:55','2025-04-20 20:28:51'),(14,6,1,2,'2025-04-23 14:30:00','Completed','test',NULL,NULL,'2025-04-20 16:59:32','2025-04-20 20:50:45'),(17,8,4,4,'2025-04-22 15:30:00','Completed','Checkup',NULL,NULL,'2025-04-20 20:31:04','2025-04-20 20:34:32'),(18,8,4,5,'2025-04-20 16:30:00','Completed','test',NULL,NULL,'2025-04-20 20:33:51','2025-04-20 20:34:23'),(19,1,2,1,'2025-04-24 12:00:00','Scheduled','test',NULL,NULL,'2025-04-20 21:38:42','2025-04-20 21:38:42'),(20,1,2,1,'2025-04-22 13:30:00','Scheduled','test',NULL,NULL,'2025-04-20 21:38:57','2025-04-20 21:38:57'),(22,9,1,3,'2025-04-25 13:30:00','Completed','Test',NULL,NULL,'2025-04-20 22:22:00','2025-04-20 23:44:27'),(23,10,1,1,'2025-05-18 13:00:00','Scheduled','pregame for edc on my bday',NULL,NULL,'2025-04-20 23:56:20','2025-04-20 23:56:20'),(24,10,1,2,'2025-04-24 16:30:00','Completed','anger management after abSAers + pregame for mgc',NULL,NULL,'2025-04-20 23:59:33','2025-04-21 00:00:30');
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `enforce_referral_expiration` BEFORE INSERT ON `appointment` FOR EACH ROW BEGIN
  DECLARE referralDate DATE;
  DECLARE specialization VARCHAR(100);

  SELECT Specialization INTO specialization
  FROM doctor
  WHERE DoctorID = NEW.DoctorID;

  IF LOWER(specialization) <> 'primary care physician' THEN

    SELECT CreatedAt INTO referralDate
    FROM referral
    WHERE PatientID = NEW.PatientID
      AND SpecialistDoctorID = NEW.DoctorID
      AND Status = 'Approved'
    ORDER BY CreatedAt DESC
    LIMIT 1;

    IF referralDate IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No active referral found for this specialist.';
    ELSEIF DATEDIFF(CURDATE(), referralDate) > 90 THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Referral has expired. Please obtain a new one.';
    END IF;

  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `limit_doctor_daily_appointments` BEFORE INSERT ON `appointment` FOR EACH ROW BEGIN
  DECLARE apptCount INT;
  DECLARE apptDate DATE;

  SET apptDate = DATE(NEW.DateTime);

  SELECT COUNT(*) INTO apptCount
  FROM appointment
  WHERE DoctorID = NEW.DoctorID
    AND DATE(DateTime) = apptDate;

  IF apptCount >= 10 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Doctor has reached the daily appointment limit of 10.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing`
--

LOCK TABLES `billing` WRITE;
/*!40000 ALTER TABLE `billing` DISABLE KEYS */;
INSERT INTO `billing` VALUES (1,1,1,NULL,1,250.00,'Paid','2025-01-20','Credit Card','2025-01-20',NULL,'2025-04-09 15:45:56','2025-04-09 15:45:56'),(2,1,2,1,3,350.00,'Paid','2025-01-31','Insurance','2025-02-15',NULL,'2025-04-09 15:45:56','2025-04-12 01:27:16'),(7,1,8,NULL,NULL,50.00,'Paid','2025-04-20','Debit Card','2025-04-21',NULL,'2025-04-20 03:07:40','2025-04-21 01:22:30'),(12,1,9,NULL,NULL,50.00,'Paid','2025-04-20','Debit Card','2025-04-21',NULL,'2025-04-20 14:23:27','2025-04-21 01:22:56'),(13,1,10,NULL,NULL,50.00,'Pending','2025-04-20',NULL,NULL,NULL,'2025-04-20 14:26:25','2025-04-20 14:26:25'),(16,4,12,NULL,NULL,50.00,'Paid','2025-04-20','Debit Card','2025-04-20',NULL,'2025-04-20 15:31:12','2025-04-20 15:47:55'),(19,5,13,NULL,NULL,50.00,'Pending','2025-04-20',NULL,NULL,NULL,'2025-04-20 16:57:55','2025-04-20 16:57:55'),(20,6,14,NULL,NULL,50.00,'Pending','2025-04-20',NULL,NULL,NULL,'2025-04-20 16:59:32','2025-04-20 16:59:32'),(21,1,1,1,1,11111.00,'Pending','2025-04-20',NULL,NULL,NULL,'2025-04-20 17:51:43','2025-04-20 17:51:43'),(22,4,1,3,4,9999.00,'Paid','2025-04-20','Credit Card','2025-04-20','test','2025-04-20 17:53:05','2025-04-20 18:06:14'),(31,8,17,NULL,NULL,50.00,'Paid','2025-04-20','Credit Card','2025-04-20',NULL,'2025-04-20 20:31:04','2025-04-20 20:32:01'),(32,8,18,NULL,NULL,50.00,'Pending','2025-04-20',NULL,NULL,NULL,'2025-04-20 20:33:51','2025-04-20 20:33:51'),(38,1,19,NULL,NULL,50.00,'Paid','2025-04-20','Credit Card','2025-04-21',NULL,'2025-04-20 21:38:42','2025-04-21 01:23:31'),(39,1,20,NULL,NULL,50.00,'Paid','2025-04-20','Credit Card','2025-04-21',NULL,'2025-04-20 21:38:57','2025-04-21 01:22:00'),(41,9,22,NULL,NULL,50.00,'Pending','2025-04-20',NULL,NULL,NULL,'2025-04-20 22:22:00','2025-04-20 22:22:00'),(42,10,24,NULL,1,999999.00,'Paid','2025-04-21','Credit Card','2025-04-21',NULL,'2025-04-21 00:03:01','2025-04-21 00:05:03');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES (1,2,'Aaron','Smith','Primary Care Physician','111-222-3333'),(2,4,'Christina','Yang','Cardiologist','555-111-2222'),(3,8,'dtest','test','test','111-111-1111'),(4,11,'Steven','Moreno','Primary Care Physician','124-465-4567'),(5,12,'Grace','Martin','Primary Care Physician','454-346-7658'),(6,13,'Melissa','Coleman','Primary Care Physician','546-767-9656'),(7,15,'Owen','Whitted','Primary Care Physician','456-789-9456'),(8,16,'Elizabeth ','Carpenter','Primary Care Physician ','465-754-7457');
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
INSERT INTO `doctor_office` VALUES (1,1,'Sat','8:00 AM - 5:00 PM'),(1,2,'Mon, Tue, Wed','9:00-15:00'),(1,3,'Thu, Fri','9:00-17:00'),(2,1,'Mon, Wed, Fri','8:00-16:00'),(3,11,'Mon - Thurs','9 - 5'),(4,4,'Mon, Tue, Wed, Thur, Fri, ','8:00 AM - 5:00 PM'),(4,5,'Sat, Sun','9:00 AM -2:00 PM'),(5,6,'Mon, Tue, Wed, Thur, Fri, ','7:00 AM - 5:00 PM'),(5,7,'Sat, Sun','9:00 AM - 1:00 PM'),(6,8,'Mon, Tue, Wed, Thur, Fri, ','7:00 AM - 4:00 PM'),(7,8,'Mon, Wed, Fri','9:00 AM - 4:00 PM'),(7,9,'Sat, Sun','8:00 AM - 2:00 PM'),(8,10,'Mon, Wed, Fri','7:00 AM - 4:00 PM'),(8,11,'Tu, Thu','9:00 AM - 5:00 PM');
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'Admin User','$2a$12$5uIVdBHtUAViTR.AQuv05efo1yQbiTjq8hyubTOtEPKkGRwSTWihS','admin@example.com','Admin'),(2,'Dr. Smith','$2a$12$57Yi.kgGxDQDoyeVZZwfnOp8GSb9JdUntsXYhULs8Rkf4I8unOYQ2','doctor@example.com','Doctor'),(3,'John.Doe123','$2b$10$HNDTzd2okXopdKnBJPHnwOClOnjRsVyNfHdWG3hMicTAN6cY9KhrG','john.doe@example.com','Patient'),(4,'Dr.Yang','$2a$12$ylUFDdssVKu..2nIrAm/CuoHV3hf5jpPpPC0.ObTzpUN0By5la6De','yang.heart@example.com','Doctor'),(5,'test','$2b$10$SNVX86H4fTesYDNrCCSmM.fdfHzYmnIlbe4TJk0ChklC.7r2dK2B6','test@example.com','Patient'),(7,'adriaanchu','$2b$10$RScNkd8KegcnsD5d1UrG4uoTsacMH0GUpW55tlySml3WZESMTaKmG','chuchuuthetrain@gmail.com','Patient'),(8,'dtest','$2b$10$uLmnP5RHEMzOlVeXTML/8O/KsicWOLKt8z5KlMkSJxNwNlCBaipei','dtest@example.com','Doctor'),(9,'sandrakho1','$2b$10$DP1G9sjcJyk5mL6GmH5Ale67gjI.lk3Em2epgdfw.P3Z4UU6P6m7m','sandrakho281@gmail.com','Patient'),(10,'jasonvu','$2b$10$TDeuU0DTFAj4nouuigBHOuLvWkD5oixnKXK.JZL5gztGCb2orpf8C','jasonvu@gmail.com','Patient'),(11,'st3veM','$2b$10$Qbrz.CjUHEpLFoqut8bLueOooGCrYVDMN51k1bRDVsL/5YcYZrCiu','steveM@example.com','Doctor'),(12,'grac321','$2b$10$a83H7OfYlkTXffLDH..NVu3QGVcBOHpuNRBes/4qrMYdDk0JJdKFS','grac3@example.com','Doctor'),(13,'MeliDC','$2b$10$Ovkgs5x0UGfx0BLjTwL3bOiBdORoWLclu.EHmwFmNn4rQ5do/Jqhe','MelissaDC@example.com','Doctor'),(15,'Owen12','$2b$10$kH.dHSnrN90NaUYZcNkj4Ouphu.9wlQ94ofBW3r3rpDiN4mO6upia','OwenWttd@example.com','Doctor'),(16,'EliZC','$2b$10$dLRfFSHBdE90r4vRBF/FOOcbvAZz1PnW4.h8SXYz0eea7RnmgTJDO','EliZC@example.com','Doctor'),(18,'w3ybear','$2b$10$4KlnxTj6bFEaTHAClAGCuuU0NGnIF6RAFm5UiJmE6XmwReMtvXZyO','w3ybear@example.com','Patient'),(19,'jsnvu','$2b$10$bOBmA/dS5gC2fxTk6ouwGOsP3wrXABWFAtpxrqElFbWMfH/K6mdHq','jason.vu@gmail.com','Patient'),(20,'rachie','$2b$10$p59TIx19FFOY3.gCSfchtO/x5dpEP1n8ryQ9wy1c2opqlTLSVmede','rachelbanh03@gmail.com','Patient');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicalrecord`
--

LOCK TABLES `medicalrecord` WRITE;
/*!40000 ALTER TABLE `medicalrecord` DISABLE KEYS */;
INSERT INTO `medicalrecord` VALUES (1,1,1,1,'2025-01-20','Overall Healthy, heart palpitations, slightly elevated blood pressure ','Monitor blood pressure, diet and exercise recommendations','Referral made with cardiologist','2025-01-20 14:00:00','2025-04-09 15:08:57'),(2,1,2,2,'2025-01-31','Mild arrhythmia','Prescribed metoprolol 25mg daily','ECG shows mild irregularities','2025-01-31 18:00:00','2025-04-09 15:08:57'),(3,1,NULL,1,'2025-04-20','test','test','test','2025-04-20 11:29:50','2025-04-20 11:29:50'),(4,1,NULL,1,'2025-04-20','test','test','test','2025-04-20 11:34:48','2025-04-20 11:34:48'),(5,1,NULL,1,'2025-04-20','test','test','test','2025-04-20 20:30:48','2025-04-20 20:30:48'),(6,1,NULL,1,'2025-04-20','test','test','test','2025-04-20 20:42:00','2025-04-20 20:42:00'),(7,1,NULL,1,'2025-04-20','test','test','test','2025-04-20 20:47:02','2025-04-20 20:47:02'),(8,1,NULL,2,'2025-04-20','test','test','test','2025-04-20 20:50:37','2025-04-20 20:50:37');
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicaltest`
--

LOCK TABLES `medicaltest` WRITE;
/*!40000 ALTER TABLE `medicaltest` DISABLE KEYS */;
INSERT INTO `medicaltest` VALUES (1,1,1,1,1,'Complete Blood Count','Laboratory','2025-01-20','Results Available','Within normal limits','2025-01-20',NULL,'2025-04-09 15:24:06','2025-04-09 15:24:06'),(2,1,1,1,1,'Lipid Panel','Laboratory','2025-01-20','Results Available','Elevated LDL: 145, HDL: 45, Total: 220','2025-04-20','test','2025-04-09 15:24:06','2025-04-20 13:51:10'),(3,1,2,2,1,'ECG','Cardiology','2025-01-31','Results Available','Mild arrhythmia detected','2025-01-31',NULL,'2025-04-09 15:24:06','2025-04-09 15:24:06'),(4,1,1,NULL,1,'test','test','2025-04-20','Results Available','test','2025-04-20','test','2025-04-20 12:10:00','2025-04-20 12:16:19'),(5,1,1,NULL,10,'test','test','2025-04-20','Results Available','test','2025-04-20','test','2025-04-20 12:47:07','2025-04-20 12:47:18'),(8,4,1,NULL,11,'test','test','2025-04-23','Ordered',NULL,NULL,'test','2025-04-20 20:17:38','2025-04-20 20:17:38'),(9,1,2,NULL,3,'test','test','2025-04-23','Ordered',NULL,NULL,'test','2025-04-20 20:28:15','2025-04-20 20:28:15'),(10,1,1,NULL,4,'test','test','2025-04-26','Ordered',NULL,NULL,'test','2025-04-20 20:48:10','2025-04-20 20:48:10'),(11,5,2,NULL,11,'test','test','2025-04-20','Ordered',NULL,NULL,'test','2025-04-20 20:50:07','2025-04-20 20:50:07');
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `office`
--

LOCK TABLES `office` WRITE;
/*!40000 ALTER TABLE `office` DISABLE KEYS */;
INSERT INTO `office` VALUES (1,'Medical Center','111-111-1111','123 Main St','Houston','Texas','77803','medi.center@example.com','Mon-Fri: 8:00am-6:00pm'),(2,'Community Clinic','222-222-2222','124 Blake St','Houston','Texas','77502','comm.clinic@example.com','Mon-Fri: 8:00am-5:00pm, Sat-Sun: 9:00am-1:00pm'),(3,'UH Clinic','333-333-3333','4349 Martin Luther King Blvd','Houston','Texas','77204','UHClinic@example.com','Mon-Fri: 8:00am-7:00pm, Sat-Sun: 8:00am-5:00pm'),(4,'Main Street Medical Center','444-444-4444','123 Main Street','San Francisco','California','94110','main.medi@example.com','Mon-Fri: 8:00am-6:00pm, Sat-Sun: 9:00am-7:00pm'),(5,'Westside Health Clinic','999-999-1111','456 West Avenue','Los Angeles','California','90001','west.clinic@example.com','Mon-Fri: 7:00am-8:00pm, Sat-Sun: 9:00am-2:00pm'),(6,'Swift Aid Clinic','222-444-1111','3479 Oakdale Avenue','Lake Placid','Florida','33852','swiftAid.clinic@example.com','Mon-Fri: 7:00am-8:00pm, Sat-Sun: 8:00am-3:00pm'),(7,'Care Point Clinic','321-123-1234','3444 Pleasant Hill Road','Pahokee','Florida','33476','carepoint.clinic@example.com','Mon-Fri: 7:00am-8:00pm, Sat-Sun: 8:00am-4:00pm'),(8,'Harmony Clinic','432-234-4345','2458 Hartway Street','Browns Valley','South Dakota','56219','harmonyClinic.clinic@example.com','Mon-Fri: 7:00am-7:00pm, Sat-Sun: 8:00am-2:00pm'),(9,'Vitality Clinic','456-654-4567','4230 Elsie Drive','Roscoe','South Dakota','57471','vitality.clinic@example.com','Mon-Fri: 7:00am-8:00pm, Sat-Sun: 8:00am-4:00pm'),(10,'RestoreHealth Clinic','888-888-1111','888 Waterfront Dr','Seattle','Washington','98104','restoreHealth@example.com','Mon-Fri: 7:00am-7:00pm, Sat-Sun: 8:00am-5:00pm'),(11,'Vibrant Clinic','777-777-1111','789 Central Blvd','Seattle','Washington','98101','vib.clinic@example.com','Mon-Fri: 7:00am-6:00pm, Sat-Sun: 8:00am-12:00pm');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (1,3,'John','Doe','1969-12-29','Male','555-555-5555','321 Hillbrook Dr ','Sugar Land','TX',''),(2,5,'test','test','1111-11-11','Male','111-111-1111','111 test','test','TX','11111'),(4,7,'Adrian','Chu','2002-11-07','Male','3464935414','4342 Willow Beach Dr.','Houston','TX','77072'),(5,9,'Sandra','Khong','2005-01-28','Female','2817486120','6835 Stoneyvale Dr','Houston ','TX','77083'),(6,10,'Jason','Vu','2025-04-20','Male','111-111-1111','111 test','test','TX','11111'),(8,18,'Wendy','Lacan','2002-12-23','Female','345-534-6788','188 Hilldale Lane','Palmdale','CA','93550'),(9,19,'Jason','Vu','2025-04-20','Male','111-111-1111','111 test','Test','TX','11111'),(10,20,'Rachel','Banh','2003-05-18','Female','7133776700','12022 Terraza Cove Ln.','Houston','TX','77041');
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
INSERT INTO `patient_doctor_assignment` VALUES (1,3,'2025-04-20',1),(2,1,'2025-04-20',1),(4,6,'2025-04-20',1),(5,8,'2025-04-20',1),(6,1,'2025-04-20',1),(8,4,'2025-04-20',1),(9,1,'2025-04-20',1),(10,1,'2025-04-20',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES (1,1,2,2,'Metoprolol','25mg','Once daily','2025-01-31','2025-03-31','Take in the morning with food','Completed','2025-04-09 15:16:41'),(2,1,1,4,'Metoprolol','25mg','Once Daily','2025-04-11','2025-06-11','Take with a meal','Active','2025-04-19 21:41:42'),(3,1,1,4,'test','test','test','2025-04-20','2025-04-23','test','Active','2025-04-20 12:40:19'),(4,1,1,8,'test','test','test','2025-04-20','2025-04-26','test','Active','2025-04-20 12:47:52'),(6,4,1,12,'test','test','test','2025-04-20','2025-04-26','test','Active','2025-04-20 20:16:43'),(7,1,2,2,'test','test','test','2025-04-20','2025-04-26','test','Active','2025-04-20 20:27:59'),(8,1,1,1,'test','test','test','2025-04-20','2025-04-26','test','Active','2025-04-20 20:47:53'),(9,1,2,2,'test','test','test','2025-04-20','2025-04-26','test','Active','2025-04-20 20:49:35');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referral`
--

LOCK TABLES `referral` WRITE;
/*!40000 ALTER TABLE `referral` DISABLE KEYS */;
INSERT INTO `referral` VALUES (1,1,1,2,'2025-01-31','Heart palpitations requiring cardiology assessment','Completed','Patient reporting occasional rapid heartbeat','2025-04-09 15:35:29','2025-04-09 15:35:29'),(2,1,1,2,'2025-04-20','test','Approved','test','2025-04-20 12:48:09','2025-04-20 20:27:17'),(3,1,2,2,'2025-04-20','test','Approved','test','2025-04-20 14:56:39','2025-04-20 20:27:18'),(5,1,4,3,'2025-04-20','test','Pending','test','2025-04-20 20:16:09','2025-04-20 20:16:09'),(6,1,5,8,'2025-04-20','test','Pending','test','2025-04-20 20:47:32','2025-04-20 20:47:32');
/*!40000 ALTER TABLE `referral` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `limit_active_referrals` BEFORE INSERT ON `referral` FOR EACH ROW BEGIN
  DECLARE activeCount INT;
  SELECT COUNT(*) INTO activeCount
  FROM referral
  WHERE PatientID = NEW.PatientID AND Status = 'Approved';

  IF activeCount >= 3 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Cannot have more than 3 active referrals per patient.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-20 21:13:17
