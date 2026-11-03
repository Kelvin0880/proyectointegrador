-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: unphu
-- ------------------------------------------------------
-- Server version	8.4.4

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
-- Table structure for table `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (1,'Audiovisual','Departamento encargado de equipos audiovisuales para clases y eventos','2025-03-20 03:24:02','2025-03-20 03:24:02'),(2,'Tecnología','Departamento encargado de equipos tecnológicos y herramientas informáticas','2025-03-20 03:24:02','2025-03-20 03:24:02');
/*!40000 ALTER TABLE `departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `departamento_id` int NOT NULL,
  `cantidad_total` int NOT NULL DEFAULT '0',
  `cantidad_disponible` int NOT NULL DEFAULT '0',
  `estado` enum('Disponible','Agotado','En mantenimiento') NOT NULL DEFAULT 'Disponible',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `departamento_id` (`departamento_id`),
  CONSTRAINT `items_ibfk_1` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'Cable HDMI','Cable de alta calidad para transmisión de señal de video y audio en alta definición. Compatible con televisores, proyectores y dispositivos de entretenimiento.',1,20,20,'Disponible','2025-03-20 03:24:02','2025-03-20 03:24:02'),(2,'Cable VGA','Cable de conexión VGA para equipos de video, usado comúnmente en proyectores y monitores de computadoras. Ideal para transmitir señal analógica.',1,20,20,'Disponible','2025-03-20 03:24:02','2025-03-20 17:30:02'),(3,'Adaptador HDMI a VGA','Adaptador para convertir señales de video digital HDMI a analógico VGA. Permite conectar dispositivos modernos como laptops a monitores o proyectores antiguos.',1,10,10,'Disponible','2025-03-20 03:24:02','2025-03-20 03:24:02'),(4,'Cables HDMI','Cables para conectar dispositivos HDMI a monitores o proyectores',2,15,15,'Disponible','2025-03-20 03:24:02','2025-03-20 03:24:02'),(5,'Adaptador HDMI a DisplayPORT','Adaptador para convertir señales HDMI a DisplayPort',2,8,8,'Disponible','2025-03-20 03:24:02','2025-03-20 03:24:02'),(6,'Cables VGA','Cables de conexión VGA estándar',2,10,10,'Disponible','2025-03-20 03:24:02','2025-03-20 03:24:02'),(7,'Vision nocturna','ya tu sabe',2,53,53,'Disponible','2025-03-20 05:38:19','2025-03-20 05:38:19'),(8,'hdmi vga','adada',1,5,5,'Disponible','2025-03-20 17:31:18','2025-03-20 18:10:51'),(9,'Pizzara movil',' Pizarra de 32 pulgadas',2,54,54,'Disponible','2025-03-20 18:09:19','2025-03-20 18:09:19');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes`
--

DROP TABLE IF EXISTS `solicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `item_id` int NOT NULL,
  `fecha_solicitud` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_uso` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `motivo` text NOT NULL,
  `estado` enum('Pendiente','Aprobada','Rechazada','Finalizada') NOT NULL DEFAULT 'Pendiente',
  `comentarios` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes`
--

LOCK TABLES `solicitudes` WRITE;
/*!40000 ALTER TABLE `solicitudes` DISABLE KEYS */;
INSERT INTO `solicitudes` VALUES (2,2,2,'2025-03-20 17:26:34','2025-03-21','14:26:00','15:52:00',' lo quiero usar jeje','Finalizada','no lo tenemos disponible\n','2025-03-20 17:26:34','2025-03-20 17:30:02'),(3,2,8,'2025-03-20 17:32:00','2025-03-21','13:31:00','17:31:00','clases','Finalizada',NULL,'2025-03-20 17:32:00','2025-03-20 18:10:51'),(4,4,7,'2025-03-20 18:06:10','2025-03-21','14:00:00','16:00:00',' quiero usarlo para mi clase de derecho','Rechazada',NULL,'2025-03-20 18:06:10','2025-03-20 18:07:39');
/*!40000 ALTER TABLE `solicitudes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricula` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','usuario') NOT NULL DEFAULT 'usuario',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricula` (`matricula`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','admin@unphu.edu.do','Administrador','Sistema','$2b$10$X7o4c5sLUQAVyFXsn.8yJeZ1YYSFrnVQKrYf5VQ1xAGr2KTDQfTnu','admin','2025-03-20 03:24:02','2025-03-20 03:24:02'),(2,'lc22-1392','lc22-1392@unphu.edu.do','Luis','Calderon','$2b$10$X21ueO8oKgYiYNYjH2XrPOxuV/a26a0OPcN.ZbIBTuwI5N.St1MIO','usuario','2025-03-20 03:52:20','2025-03-20 03:52:20'),(3,'superadmin','superadmin@unphu.edu.do','Super','Admin','$2b$10$mFXiOinR2agYeYj3S5dtl.8nq8yfbGlrGDplIJDy6kj1Mka0cXAoa','admin','2025-03-20 04:35:41','2025-03-20 04:41:08'),(4,'jm18-0990','jm18-0990@unphu.edu.do','Juan','Miliano','$2b$10$kb50fRq2FvJOPuBlMcnRBubirhlgMNXoOoG1OwIvB9eCDNcobxyAe','usuario','2025-03-20 18:05:01','2025-03-20 18:05:01'),(5,'mariomesa','mariomesa@unphu.edu.do','Mario','Mesa','$2b$10$MIq947WVQoKZvvc9YV1i0.my4lRRbebW33rrMeaqBTJfrtQ2CqWFy','usuario','2025-03-20 18:16:15','2025-03-20 18:16:15');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-20 19:05:30
