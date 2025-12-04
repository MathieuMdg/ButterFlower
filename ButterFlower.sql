CREATE DATABASE  IF NOT EXISTS `butterflower` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `butterflower`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: butterflower
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `albums`
--

DROP TABLE IF EXISTS `albums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `albums` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `artist` varchar(255) NOT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `release_year` int DEFAULT NULL,
  `genre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `albums`
--

LOCK TABLES `albums` WRITE;
/*!40000 ALTER TABLE `albums` DISABLE KEYS */;
INSERT INTO `albums` VALUES (1,'Random Access Memories','Daft Punk','https://media.pitchfork.com/photos/63f641d801dbe796fab80055/1:1/w_320,c_limit/Daft-Punk-Random-Access-Memories.jpg',2013,'Electro'),(2,'Abbey Road','The Beatles','https://m.media-amazon.com/images/I/61Nf4UVtDkL._SY300_SX300_QL70_FMwebp_.jpg',1969,'Rock'),(3,'Lemonade','Beyoncé','https://upload.wikimedia.org/wikipedia/en/5/53/Beyonce_-_Lemonade_%28Official_Album_Cover%29.png',2016,'Pop'),(4,'Thriller','Michael Jackson','https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png',1982,'Pop'),(5,'Nevermind','Nirvana','https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg',1991,'Rock'),(6,'Back To Black','Amy Winehouse','https://m.media-amazon.com/images/I/71YhebDzEtL._UF1000,1000_QL80_.jpg',2006,'Soul'),(7,'To Pimp a Butterfly','Kendrick Lamar','https://m.media-amazon.com/images/I/81015y0a1hL._UF1000,1000_QL80_.jpg',2015,'Hip-Hop'),(8,'A Rush of Blood to the Head','Coldplay','https://m.media-amazon.com/images/I/71ag0NTZyvL._UF1000,1000_QL80_.jpg',2002,'Rock'),(9,'Discovery','Daft Punk','https://m.media-amazon.com/images/I/71bsHTr6idL._UF1000,1000_QL80_.jpg',2001,'Electro'),(10,'Lateralus','Tool','https://i.ebayimg.com/images/g/JaYAAOSwsJJiOI-d/s-l1200.jpg',2001,'Metal'),(11,'Melodrama','Lorde','https://m.media-amazon.com/images/I/51Ti1Xc5I+L._SY300_SX300_QL70_FMwebp_.jpg',2017,'Pop'),(12,'Good Kid, M.A.A.D City','Kendrick Lamar','https://upload.wikimedia.org/wikipedia/en/thumb/9/93/KendrickGKMC.jpg/250px-KendrickGKMC.jpg',2012,'Hip-Hop'),(13,'Homework','Daft Punk','https://m.media-amazon.com/images/I/71A1gmVPm-L._UF1000,1000_QL80_.jpg',1997,'Electro'),(14,'DON\'T TAP THE GLASS','Tyler, The Creator','https://m.media-amazon.com/images/I/31sDbu7nBBL._UXNaN_FMjpg_QL85_.jpg',2025,'Hip-hop'),(16,'Starboy','The Weeknd','https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png',2016,'Pop'),(17,'All Eyez on Me','2Pac','https://upload.wikimedia.org/wikipedia/en/1/16/Alleyezonme.jpg',1996,'Hip-Hop'),(18,'Utopia','Travis Scott','https://upload.wikimedia.org/wikipedia/en/2/23/Travis_Scott_-_Utopia.png',2023,'Hip-Hop'),(19,'ALBUM','Yuno Miles','https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Yuno_Miles_-_Album_cover.png/1200px-Yuno_Miles_-_Album_cover.png?20251129212453',2025,'Brainrot'),(20,'Hardstone Psycho','Don Toliver','https://upload.wikimedia.org/wikipedia/en/2/21/Don_Toliver_-_Hardstone_Psycho.png',2024,'Hip-Hop'),(21,'Lyfë','Yeat','https://upload.wikimedia.org/wikipedia/en/4/48/Lyf%C3%AB.jpeg',2022,'Hip-Hop'),(22,'For All The Dogs','Drake','https://upload.wikimedia.org/wikipedia/en/0/05/Drake_-_For_All_The_Dogs.png',2023,'Hip-Hop'),(23,'Scorpion','Drake','https://upload.wikimedia.org/wikipedia/en/9/90/Scorpion_by_Drake.jpg',2018,'Hip-Hop'),(24,'ZZCCMXTP','Legendes Industries','https://i.scdn.co/image/ab67616d0000b2731fa62ed2dcf0569d9b9ff509',2022,'Brainrot'),(25,'Whole Lotta Red','Playboy Carti','https://upload.wikimedia.org/wikipedia/en/6/6c/Playboi_Carti_-_Whole_Lotta_Red.png',2020,'Hip-Hop');
/*!40000 ALTER TABLE `albums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chansons`
--

DROP TABLE IF EXISTS `chansons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chansons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(255) DEFAULT NULL,
  `album_id` int DEFAULT NULL,
  `duree` varchar(10) DEFAULT NULL,
  `url_audio` varchar(255) DEFAULT NULL,
  `paroles` text,
  PRIMARY KEY (`id`),
  KEY `album_id` (`album_id`),
  CONSTRAINT `chansons_ibfk_1` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chansons`
--

LOCK TABLES `chansons` WRITE;
/*!40000 ALTER TABLE `chansons` DISABLE KEYS */;
INSERT INTO `chansons` VALUES (1,'Wanna Be Startin\' Somethin\'',4,'6:03','https://open.spotify.com/embed/track/1hu2s7qkm5bo03eODpRQO3?utm_source=generator','You wanna be startin somethin'),(2,'Baby Be Mine',4,'4:20','https://open.spotify.com/embed/track/6XYbMGvtl6tlPoGWaiH7EY?utm_source=generator','The doggone girl is mine'),(3,'The Girl Is Mine',4,'3:42','https://open.spotify.com/embed/track/4IT6vDuKprKl6jyVndlY8V?utm_source=generator','The girl is mine'),(4,'Thriller',4,'5:57','https://open.spotify.com/embed/track/2LlQb7Uoj1kKyGhlkBf9aC?utm_source=generator','Cause this is thriller'),(5,'Beat It',4,'4:18','https://open.spotify.com/embed/track/3BovdzfaX4jb5KFQwoPfAw?utm_source=generator','Just beat it'),(6,'Billie Jean',4,'4:54','https://open.spotify.com/embed/track/7J1uxwnxfQLu4APicE5Rnj?utm_source=generator','Billie Jean is not my lover'),(7,'Human Nature',4,'4:06','https://open.spotify.com/embed/track/4cgjA7B4fJBHyB9Ya2bu0t?utm_source=generator','If they say why why'),(8,'P.Y.T. (Pretty Young Thing)',4,'3:59','https://open.spotify.com/embed/track/1CgmY8fVN7kstVDZmsdM5k?utm_source=generator','Pretty young thing'),(9,'The Lady in My Life',4,'4:59','https://open.spotify.com/embed/track/07L1pzoVerhRSSaDGZHrKy?utm_source=generator','She is the one');
/*!40000 ALTER TABLE `chansons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes_chansons`
--

DROP TABLE IF EXISTS `notes_chansons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes_chansons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chanson_id` int NOT NULL,
  `user_id` int NOT NULL,
  `note` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_chanson` (`user_id`,`chanson_id`),
  KEY `chanson_id` (`chanson_id`),
  CONSTRAINT `notes_chansons_ibfk_1` FOREIGN KEY (`chanson_id`) REFERENCES `chansons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes_chansons`
--

LOCK TABLES `notes_chansons` WRITE;
/*!40000 ALTER TABLE `notes_chansons` DISABLE KEYS */;
INSERT INTO `notes_chansons` VALUES (1,1,2,3),(2,2,2,4),(3,3,2,2),(4,8,1,4),(5,8,2,4),(6,4,5,5),(7,3,5,4),(8,2,5,4),(9,1,5,4),(12,5,5,5),(13,6,5,5),(14,7,5,5),(15,8,5,5),(16,9,5,4),(22,1,6,4),(23,2,6,4),(28,3,6,4),(30,4,6,5),(31,5,6,5),(32,6,6,5),(33,7,6,5),(34,8,6,5),(35,9,6,4);
/*!40000 ALTER TABLE `notes_chansons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `album_id` int DEFAULT NULL,
  `rating` float(2,1) DEFAULT NULL,
  `review_text` text,
  `review_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `album_id` (`album_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`),
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 10))
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (16,2,4,5.0,'Masterpiece!!!','2025-11-25 14:51:41'),(18,2,1,4.0,'skibidi','2025-11-26 10:13:50'),(19,2,10,3.5,NULL,'2025-11-26 10:36:17'),(20,2,14,5.0,'It\'s just so peak','2025-11-26 11:34:46'),(21,1,14,4.5,'So strange yet so good!!','2025-11-28 17:29:04'),(23,5,1,5.0,'raaaah','2025-12-01 18:24:32'),(24,5,4,5.0,'blud knows his music ong fr fr','2025-12-01 18:29:26'),(25,5,14,3.0,'its aight','2025-12-01 18:40:45'),(26,5,10,1.0,'rawr','2025-12-01 18:41:20'),(27,5,6,4.5,'oh my days broski','2025-12-01 18:41:34'),(28,5,5,3.5,'这张专辑还可以。','2025-12-01 18:42:42'),(29,5,2,4.0,'pov tu marches ?‍➡️','2025-12-01 18:44:02'),(30,6,19,4.0,'omggg im in love yuno miles you so handsome','2025-12-04 23:41:40'),(31,6,25,3.5,'fweh','2025-12-04 23:41:54'),(32,6,24,4.0,'en légendre','2025-12-04 23:42:08');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `can_comment` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mama','mama@gmail.com','$2b$10$akcdDRjMe79nJyfOygznUuRDkx9NqldyKNMbWcw9NWTm8B3p00P0u','user',1),(2,'Mathieu_Mdg','mathieu.mdg@gmail.com','$2b$10$wOt883d3jwuqIQcs4dTSLO.e5LGsKCsIj9tzTD8CcCgvLJ8WYeAaO','user',1),(3,'Bloque','bloque@gmail.com','$2b$10$T3tLAeMmKETygkia0V0PQe.aqz.xr/FyYJf0Y543y4EBFYBkKvkS2','user',0),(4,'Admin','admin@gmail.com','$2b$10$Sg22IdgGz0oJL2lcz/wtke.5y8Rsa.4HcF/Tlta2C46aSSFj.TTzS','admin',1),(5,'yohanes','yoann@gmail.com','$2b$10$c.xwWssYIPTRukcoX8eZGOpi.ObnoXNzsfdBDdgGWqTY1/KMrZW2y','user',1),(6,'yohanes admin','newadmin@gmail.com','$2b$10$eMBEKkZ.YXFtHPm4SyY6.OXs4k3nOZJme0nu8cJPWdV2R7LmlsMEK','admin',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-05  1:19:39
