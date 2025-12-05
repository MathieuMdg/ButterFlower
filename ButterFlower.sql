CREATE DATABASE  IF NOT EXISTS `butterflower` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `butterflower`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: butterflower
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
  `deezer_id` varchar(255) DEFAULT NULL,
  `duree` varchar(10) DEFAULT NULL,
  `url_audio` varchar(500) DEFAULT NULL,
  `deezer_preview_url` varchar(500) DEFAULT NULL,
  `paroles` text,
  PRIMARY KEY (`id`),
  KEY `album_id` (`album_id`),
  CONSTRAINT `chansons_ibfk_1` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chansons`
--

LOCK TABLES `chansons` WRITE;
/*!40000 ALTER TABLE `chansons` DISABLE KEYS */;
INSERT INTO `chansons` VALUES (1,'Wanna Be Startin\' Somethin\'',4,'831216','6:03','https://open.spotify.com/embed/track/1hu2s7qkm5bo03eODpRQO3?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/0/8/3/0/083d0d153a1005e529732c857e87c2b5.mp3?hdnea=exp=1764916169~acl=/api/1/1/0/8/3/0/083d0d153a1005e529732c857e87c2b5.mp3*~data=user_id=0,application_id=42~hmac=3f3d0997b6a544b4ff74f93f3f642f24e653ca73050ebc962af8d60a6e90afd9','You wanna be startin somethin'),(2,'Baby Be Mine',4,'831289','4:20','https://open.spotify.com/embed/track/6XYbMGvtl6tlPoGWaiH7EY?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/3/0/4/0/3048781b11102865fa4c55b273e93a80.mp3?hdnea=exp=1764916170~acl=/api/1/1/3/0/4/0/3048781b11102865fa4c55b273e93a80.mp3*~data=user_id=0,application_id=42~hmac=b8f0da333281093015a717f7983b0024e12ece0a071f902f14027cdf2c830f1c','The doggone girl is mine'),(3,'The Girl Is Mine',4,'831298','3:42','https://open.spotify.com/embed/track/4IT6vDuKprKl6jyVndlY8V?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/4/5/0/0/4502ef8b9064c79a6237009adcbbcae8.mp3?hdnea=exp=1764916171~acl=/api/1/1/4/5/0/0/4502ef8b9064c79a6237009adcbbcae8.mp3*~data=user_id=0,application_id=42~hmac=a21cd1de04e841f8a7ff764f628c0eeea1a9723f32afe32fc2b1cc94f435209b','The girl is mine'),(4,'Thriller',4,'555639','5:57','https://open.spotify.com/embed/track/2LlQb7Uoj1kKyGhlkBf9aC?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/3/8/3/0/3832b349ee4d8b66f6022bc99dcca300.mp3?hdnea=exp=1764916171~acl=/api/1/1/3/8/3/0/3832b349ee4d8b66f6022bc99dcca300.mp3*~data=user_id=0,application_id=42~hmac=5b366b148d4e4c7f01c0246d067529ee73582fc7abe55b69629fd1983dc76a3f','Cause this is thriller'),(5,'Beat It',4,'4763165','4:18','https://open.spotify.com/embed/track/3BovdzfaX4jb5KFQwoPfAw?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/1/7/2/0/1726d9ef2d75c2d3adfb4f82a06ab589.mp3?hdnea=exp=1764916172~acl=/api/1/1/1/7/2/0/1726d9ef2d75c2d3adfb4f82a06ab589.mp3*~data=user_id=0,application_id=42~hmac=1327ed9ccf7d69c0dcdc45d9b44f8181cfb249cab52f51d2b3e78a55a27e4c42','Just beat it'),(6,'Billie Jean',4,'4603408','4:54','https://open.spotify.com/embed/track/7J1uxwnxfQLu4APicE5Rnj?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/e/6/e/0/e6e0f8717b1e6353e2abf797c6849889.mp3?hdnea=exp=1764916172~acl=/api/1/1/e/6/e/0/e6e0f8717b1e6353e2abf797c6849889.mp3*~data=user_id=0,application_id=42~hmac=f3753942f14d0af1f4dbb8977343bbe32572d267300c65636c103d419738ebc7','Billie Jean is not my lover'),(7,'Human Nature',4,'4603399','4:06','https://open.spotify.com/embed/track/4cgjA7B4fJBHyB9Ya2bu0t?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/2/a/1/0/2a14919bc14638265aadf5d5bfd91894.mp3?hdnea=exp=1764916173~acl=/api/1/1/2/a/1/0/2a14919bc14638265aadf5d5bfd91894.mp3*~data=user_id=0,application_id=42~hmac=94f9198174d653926d4356b03a3588174074f9d99988ea8bcca7415747f7dc7d','If they say why why'),(8,'P.Y.T. (Pretty Young Thing)',4,'555643','3:59','https://open.spotify.com/embed/track/1CgmY8fVN7kstVDZmsdM5k?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/f/e/1/0/fe1457168c32d749da5089dca9ad6034.mp3?hdnea=exp=1764916174~acl=/api/1/1/f/e/1/0/fe1457168c32d749da5089dca9ad6034.mp3*~data=user_id=0,application_id=42~hmac=9f8333fc819e76875d6c9c143403d3454c50e22651f7088ddfd97f9d949a14dd','Pretty young thing'),(9,'The Lady in My Life',4,'831190','4:59','https://open.spotify.com/embed/track/07L1pzoVerhRSSaDGZHrKy?utm_source=generator','https://cdnt-preview.dzcdn.net/api/1/1/0/a/2/0/0a2cf4a4304f6a145f4947b904bce821.mp3?hdnea=exp=1764916174~acl=/api/1/1/0/a/2/0/0a2cf4a4304f6a145f4947b904bce821.mp3*~data=user_id=0,application_id=42~hmac=9e339deefba56a20bbddd5ebae7a8b208ab1d658cfaaa47a68c5252f1e5d56fb','She is the one'),(10,'Big Poe (feat. Sk8brd)',14,'3470152931','3:25','https://open.spotify.com/embed/track/bigpoe_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/c/f/f/0/cff14b47e9d39cf27796b5fa1bd64288.mp3?hdnea=exp=1764916175~acl=/api/1/1/c/f/f/0/cff14b47e9d39cf27796b5fa1bd64288.mp3*~data=user_id=0,application_id=42~hmac=a36eb8e408c5a34a4f66794d194dc73d50c7d27487c811d77d560225974c0174',NULL),(11,'Sugar On My Tongue',14,'3470152941','2:33','https://open.spotify.com/embed/track/sugar_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/2/f/d/0/2fd3ba3b1617860c6e8d856b96a44bb7.mp3?hdnea=exp=1764916175~acl=/api/1/1/2/f/d/0/2fd3ba3b1617860c6e8d856b96a44bb7.mp3*~data=user_id=0,application_id=42~hmac=c9cd6ee18eac0670394d3e27c7293082b896ea858241250e8cf7546f5d4ae465',NULL),(12,'Sucka Free',14,'3470152951','2:41','https://open.spotify.com/embed/track/sucka_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/4/b/d/0/4bdd41d904a54b48c0147e262492dc50.mp3?hdnea=exp=1764916176~acl=/api/1/1/4/b/d/0/4bdd41d904a54b48c0147e262492dc50.mp3*~data=user_id=0,application_id=42~hmac=58279fb1255c8f77fa4f49245a8cbf60f8a308d791a9804ee8be7290fdd8ba30',NULL),(13,'Mommanem',14,'3470152961','1:15','https://open.spotify.com/embed/track/momma_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/8/0/b/0/80b7d26382efa412a2779c33c566df8e.mp3?hdnea=exp=1764916176~acl=/api/1/1/8/0/b/0/80b7d26382efa412a2779c33c566df8e.mp3*~data=user_id=0,application_id=42~hmac=069433a41c51675f667bb2e3d85059d6054233d301df57a247a7fbdf416e669c',NULL),(14,'Stop Playing With Me',14,'3470152971','2:13','https://open.spotify.com/embed/track/stop_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/1/0/3/0/103d2095452ca4f2b65bf176a9255e6f.mp3?hdnea=exp=1764916177~acl=/api/1/1/1/0/3/0/103d2095452ca4f2b65bf176a9255e6f.mp3*~data=user_id=0,application_id=42~hmac=6ec94c680fcb5f7369b53e1af05d125a5c5581b59d300b5461dd6013175775b6',NULL),(15,'Ring Ring Ring',14,'3470152981','3:21','https://open.spotify.com/embed/track/ring_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/a/c/2/0/ac21737744b9601d90b08ce8efbcc09a.mp3?hdnea=exp=1764916177~acl=/api/1/1/a/c/2/0/ac21737744b9601d90b08ce8efbcc09a.mp3*~data=user_id=0,application_id=42~hmac=4ba0fec69f47b966ebf61db711d48b970dfc624558711341207f602f5b87162d',NULL),(16,'Don\'t Tap That Glass / Tweakin\'',14,'3470152991','3:42','https://open.spotify.com/embed/track/tweakin_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/7/7/0/0/770a5cd7c178b86b3f2b1be7fab1a8f2.mp3?hdnea=exp=1764916178~acl=/api/1/1/7/7/0/0/770a5cd7c178b86b3f2b1be7fab1a8f2.mp3*~data=user_id=0,application_id=42~hmac=60da45c81839019c9e5f9b6b55ec606cf6d14da8204147bfb2a3b425b0d900e9',NULL),(17,'Don\'t You Worry Baby',14,'3470153001','2:58','https://open.spotify.com/embed/track/worry_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/1/2/a/0/12a04906fa77dbd55abf1c49980a5a97.mp3?hdnea=exp=1764916178~acl=/api/1/1/1/2/a/0/12a04906fa77dbd55abf1c49980a5a97.mp3*~data=user_id=0,application_id=42~hmac=ee3a06eaf7116bfe58643ed847a42080f2d24dfc3498d34debd7bf7625338f34',NULL),(18,'I\'ll Take Care of You',14,'3470153011','3:20','https://open.spotify.com/embed/track/care_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/e/0/b/0/e0beedb4f7a7109cf8a541f49658ad6f.mp3?hdnea=exp=1764916179~acl=/api/1/1/e/0/b/0/e0beedb4f7a7109cf8a541f49658ad6f.mp3*~data=user_id=0,application_id=42~hmac=ba839982d3a7c61505a2b5fd8c1a79dc6cc9900b7cfcc381dfcbb37ce8ddf3b2',NULL),(19,'Tell Me What It Is',14,'3470153021','3:22','https://open.spotify.com/embed/track/tellme_dummy_id','https://cdnt-preview.dzcdn.net/api/1/1/5/7/3/0/573f9ee8f143d26d5dd6815b54563ed2.mp3?hdnea=exp=1764916180~acl=/api/1/1/5/7/3/0/573f9ee8f143d26d5dd6815b54563ed2.mp3*~data=user_id=0,application_id=42~hmac=fb7f35709ab54189f5c0e9d2728cf937c9a1699e9f6246c47dbe3844335f3608',NULL);
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

-- Dump completed on 2025-12-05 14:37:27
