-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: csw303
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.24-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!50503 SET NAMES utf8 */
;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */
;
/*!40103 SET TIME_ZONE='+00:00' */
;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */
;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `students` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `LastName` varchar(100) DEFAULT NULL,
    `FirstName` varchar(100) DEFAULT NULL,
    `tel` varchar(50) DEFAULT NULL,
    `dateStudy` date DEFAULT NULL,
    `class` varchar(100) DEFAULT NULL,
    `teacher` varchar(100) DEFAULT NULL,
    `grade` float DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */
;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */
;
INSERT INTO
    `students`
VALUES (
        1,
        'Nguyễn Văn',
        'An',
        '0901234567',
        '2025-10-20',
        'IA7.1',
        'Mr. John Smith',
        10
    ),
    (
        2,
        'Trần Thị',
        'Bình',
        '0912345678',
        '2025-10-21',
        'IA7.1',
        'Mr. John Smith',
        0
    ),
    (
        3,
        'Lê Hùng',
        'Cường',
        '0987654321',
        '2025-11-25',
        'BC1.1',
        'Ms. Emily Nguyen',
        NULL
    ),
    (
        4,
        'Phạm Thị',
        'Dung',
        '0334455667',
        '2025-07-05',
        'EB1.5',
        'Mr. David Lee',
        NULL
    ),
    (
        5,
        'Hoàng Minh',
        'Khang',
        '0331122334',
        '2025-07-06',
        'EB1.5',
        'Mr. David Lee',
        NULL
    ),
    (
        6,
        'Vũ Ngọc',
        'Mai',
        '0945678901',
        '2025-09-22',
        'TO750.3',
        'Ms. Anna Tran',
        NULL
    );
/*!40000 ALTER TABLE `students` ENABLE KEYS */
;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */
;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */
;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */
;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */
;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */
;

-- Dump completed on 2025-11-23 23:56:41