-- =============================================
-- DeliveryExpress - Backup Completo de BD
-- Fecha: 2026-04-17 18:05:40
-- Base de Datos: strongme_lara453
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------
-- Tabla: `allies`
-- -----------------------------------------------
DROP TABLE IF EXISTS `allies`;

CREATE TABLE `allies` (
  `id` char(36) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `logoUrl` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `imagenes` longtext DEFAULT NULL,
  `productos` longtext DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5 registros en `allies`
INSERT INTO `allies` (`id`, `nombre`, `logoUrl`, `descripcion`, `whatsapp`, `imagenes`, `productos`, `timestamp`, `created_at`, `updated_at`) VALUES ('hl9isz6yp', 'CHURROS LOVELY', 'https://www.webcincodev.com/b2b/public/storage/uploads/l2CiWAs7VJwpfqw0YfIGmqCta7udxdBSRzvt5dpb.png', 'CHURROS', '584124708281', '[]', '[{\"id\":\"6zvqj75zi\",\"nombre\":\"CHURRO 1\",\"precio\":\"3\",\"descripcion\":\"Detalle\",\"imagenUrl\":\"https://via.placeholder.com/150\"}]', NULL, '2026-04-03 17:15:35', NULL);
INSERT INTO `allies` (`id`, `nombre`, `logoUrl`, `descripcion`, `whatsapp`, `imagenes`, `productos`, `timestamp`, `created_at`, `updated_at`) VALUES ('p73olma94', 'Maum', 'https://www.webcincodev.com/b2b/public/storage/uploads/X6zBNOlnt8UNaUATmPPis2ONYuChGOuTbRafOYwT.jpg', 'Heladería', '+584129145516', '[]', '[]', NULL, '2026-04-09 23:08:42', NULL);
INSERT INTO `allies` (`id`, `nombre`, `logoUrl`, `descripcion`, `whatsapp`, `imagenes`, `productos`, `timestamp`, `created_at`, `updated_at`) VALUES ('simxltcfq', 'WOOKIES', 'https://www.webcincodev.com/b2b/public/storage/uploads/HIerkonnsiKL6SsmVjGQmx3AiSMhqTHPvc5towDa.jpg', 'Galletas', '+584146755989', '[]', '[{\"id\":\"gfvnds9lp\",\"nombre\":\"Galletasv\",\"precio\":\"Varía \",\"descripcion\":\"\",\"imagenUrl\":\"\"}]', NULL, '2026-04-09 22:46:19', '2026-04-09 22:48:02');
INSERT INTO `allies` (`id`, `nombre`, `logoUrl`, `descripcion`, `whatsapp`, `imagenes`, `productos`, `timestamp`, `created_at`, `updated_at`) VALUES ('ubasrz7kn', 'PIZZERIA MG', 'https://www.webcincodev.com/b2b/public/storage/uploads/kmfrcHUTVxhoDz06W5nuKUx8jeHlpWqWY4Rso5BN.png', 'PIZZA', '584146529837', '[\"https://www.webcincodev.com/b2b/public/storage/uploads/CWqkiBJQ3NsPlySYc4ztgyuVnU8M4dzrZrEb4S9g.jpg\"]', '[{\"id\":\"iiwyo2uvb\",\"nombre\":\"PIZZA 1\",\"precio\":\"8\",\"descripcion\":\"Detalle\",\"imagenUrl\":\"https://via.placeholder.com/150\"},{\"id\":\"e08h2aroq\",\"nombre\":\"PIZZA2 \",\"precio\":\"3\",\"descripcion\":\"\",\"imagenUrl\":\"https://www.webcincodev.com/b2b/public/storage/uploads/RuXllScTElluZFwiGrF5gbnv0BpUs0hK9Km8VVBf.jpg\"}]', NULL, '2026-04-03 17:05:20', NULL);
INSERT INTO `allies` (`id`, `nombre`, `logoUrl`, `descripcion`, `whatsapp`, `imagenes`, `productos`, `timestamp`, `created_at`, `updated_at`) VALUES ('ylxe2ybcf', 'FRITOS MG', 'https://www.webcincodev.com/b2b/public/storage/uploads/Hgzo8utJWAp0KORfBmopH8g9ivM6KoSbrRgieE5t.png', 'Fritos', '584146529837', '[\"https://www.webcincodev.com/b2b/public/storage/uploads/8dLpNJfhkhyinZ0S9Dnoc8qHKVBjTa0wi4TPmyic.jpg\",\"https://www.webcincodev.com/b2b/public/storage/uploads/HkWfq6PsiOWqGGQHISACZaoncHxyj2dfYFSK71xV.jpg\",\"https://www.webcincodev.com/b2b/public/storage/uploads/bx5Cqikq8Ts6Wj1hbjIECNpAqJQbHHMOGbgsd36H.jpg\"]', '[{\"id\":\"r63qlezz4\",\"nombre\":\"LOMITO\",\"precio\":\"0\",\"descripcion\":\"Detalle\",\"imagenUrl\":\"https://www.webcincodev.com/b2b/public/storage/uploads/UYNmDFE7YrsFAAmkvoI1M3NcYlHyC2YoLaxiRzZW.png\"},{\"id\":\"if1kljuth\",\"nombre\":\"POLLO\",\"precio\":\"8\",\"descripcion\":\"Detalle\",\"imagenUrl\":\"\"},{\"id\":\"3ritmo2nh\",\"nombre\":\"MIXTO\",\"precio\":\"10\",\"descripcion\":\"Detalle\",\"imagenUrl\":\"https://www.webcincodev.com/b2b/public/storage/uploads/ba6cPXjO2CpxXCBFc68pRTnLNQr8ZfwtjHpsdPKa.png\"}]', NULL, '2026-04-03 16:49:20', NULL);

-- -----------------------------------------------
-- Tabla: `cache`
-- -----------------------------------------------
DROP TABLE IF EXISTS `cache`;

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (tabla vacía)

-- -----------------------------------------------
-- Tabla: `cache_locks`
-- -----------------------------------------------
DROP TABLE IF EXISTS `cache_locks`;

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (tabla vacía)

-- -----------------------------------------------
-- Tabla: `failed_jobs`
-- -----------------------------------------------
DROP TABLE IF EXISTS `failed_jobs`;

CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (tabla vacía)

-- -----------------------------------------------
-- Tabla: `job_batches`
-- -----------------------------------------------
DROP TABLE IF EXISTS `job_batches`;

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (tabla vacía)

-- -----------------------------------------------
-- Tabla: `jobs`
-- -----------------------------------------------
DROP TABLE IF EXISTS `jobs`;

CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (tabla vacía)

-- -----------------------------------------------
-- Tabla: `messages`
-- -----------------------------------------------
DROP TABLE IF EXISTS `messages`;

CREATE TABLE `messages` (
  `id` char(36) NOT NULL,
  `chatId` varchar(255) NOT NULL,
  `remitenteId` varchar(255) NOT NULL,
  `remitenteNombre` varchar(255) NOT NULL,
  `texto` text NOT NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8 registros en `messages`
INSERT INTO `messages` (`id`, `chatId`, `remitenteId`, `remitenteNombre`, `texto`, `timestamp`, `created_at`, `updated_at`) VALUES ('1cc6fa7a-1dea-4c75-b830-a19fd37fe05b', '3eyewqao7', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', 'Hhfxfgxdf', NULL, '2026-04-16 19:41:46', NULL);
INSERT INTO `messages` (`id`, `chatId`, `remitenteId`, `remitenteNombre`, `texto`, `timestamp`, `created_at`, `updated_at`) VALUES ('4778c46f-cdcd-4439-ba76-fd90aa2968a2', 'test12345', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', 'hola', NULL, '2026-04-08 14:48:11', NULL);
INSERT INTO `messages` (`id`, `chatId`, `remitenteId`, `remitenteNombre`, `texto`, `timestamp`, `created_at`, `updated_at`) VALUES ('4c8313f6-6758-44b1-aae7-063c2e0892b3', '3eyewqao7', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', 'Hola saludos ángel como estas', NULL, '2026-04-16 19:40:06', NULL);
INSERT INTO `messages` (`id`, `chatId`, `remitenteId`, `remitenteNombre`, `texto`, `timestamp`, `created_at`, `updated_at`) VALUES ('75a5ddd5-1a2d-4c56-ac7d-d986bb7cea9a', '44c7c84c-f116-4425-a009-24cb9693708d', 'f90327df-bb72-41a3-84e8-af0bd7076495', 'Super Admin', 'hola', NULL, '2026-04-08 14:50:43', NULL);
INSERT INTO `messages` (`id`, `chatId`, `remitenteId`, `remitenteNombre`, `texto`, `timestamp`, `created_at`, `updated_at`) VALUES ('b4527964-0670-4b2c-8527-55cd651b79cc', '44c7c84c-f116-4425-a009-24cb9693708d', 'f90327df-bb72-41a3-84e8-af0bd7076495', 'Super Admin', 'Como te fué con la entrega?', NULL, '2026-04-08 14:59:45', NULL);
INSERT INTO `messages` (`id`, `chatId`, `remitenteId`, `remitenteNombre`, `texto`, `timestamp`, `created_at`, `updated_at`) VALUES ('cbecf612-2a81-4806-a3dd-847ec88c361b', '44c7c84c-f116-4425-a009-24cb9693708d', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', 'Bien ya lo entregué, ya confirmo', NULL, '2026-04-08 15:04:11', NULL);
INSERT INTO `messages` (`id`, `chatId`, `remitenteId`, `remitenteNombre`, `texto`, `timestamp`, `created_at`, `updated_at`) VALUES ('ddd0baea-6486-4038-8615-e2a2c1ea2b77', 'test_chat_123', 'user1', 'Tester', 'Hello from Node', NULL, '2026-04-08 14:48:04', NULL);
INSERT INTO `messages` (`id`, `chatId`, `remitenteId`, `remitenteNombre`, `texto`, `timestamp`, `created_at`, `updated_at`) VALUES ('fb4efce8-e9f9-4c59-a4d1-6551fa69930e', '3l3hg9lr2', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', 'Hola saludos', NULL, '2026-04-16 20:03:46', NULL);

-- -----------------------------------------------
-- Tabla: `migrations`
-- -----------------------------------------------
DROP TABLE IF EXISTS `migrations`;

CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3 registros en `migrations`
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('1', '0001_01_01_000000_create_users_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('2', '0001_01_01_000001_create_cache_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('3', '0001_01_01_000002_create_jobs_table', '1');

-- -----------------------------------------------
-- Tabla: `mototaxi_tarifas`
-- -----------------------------------------------
DROP TABLE IF EXISTS `mototaxi_tarifas`;

CREATE TABLE `mototaxi_tarifas` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14 registros en `mototaxi_tarifas`
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('1', 'Mene Grande a moteo', 'Desde mene grande a san timoteo', '6.00', '1', '2026-04-15 21:46:09', '2026-04-16 01:08:52');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('2', 'Mene Grande - pueblo nuevo', 'Rancho grande, chamarreta, carorita, santa maría, las María, la golfo, la Florida, rancho grande 2, buenos aires,  niquitao , campo los andes, mercado, baralt 1. Las laras, Betania, Simon bolivar, Fonseca', '1.00', '1', '2026-04-15 22:05:54', '2026-04-16 18:54:34');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('3', 'Mene Grande la linea corto', 'Precio base por defecto para compra', '2.00', '1', '2026-04-16 00:12:11', '2026-04-16 01:10:32');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('4', 'Mene Grande la estrella', 'La estrella y siberia', '2.00', '1', '2026-04-16 00:13:57', '2026-04-16 00:13:57');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('5', 'Mene Grande los barrosos', 'Mene Grande los barrosos', '2.00', '1', '2026-04-16 01:04:14', '2026-04-16 01:04:14');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('6', 'Mene Grande san pedro', 'Casas roja, azules, San pedro', '4.00', '1', '2026-04-16 01:11:27', '2026-04-16 18:28:36');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('7', '___BASE_RECOLECCION___', 'Precio base por defecto para recoleccion', '1.00', '1', '2026-04-16 01:11:38', '2026-04-16 01:11:38');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('8', 'El patio - pueblo nuevo', 'El patio, pueblo nuevo, los algarrobo', '3.00', '1', '2026-04-16 18:33:42', '2026-04-16 18:33:42');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('9', 'Mene Grande - Altamira', 'Mene Grande, Altamira 1, Altamira 2, la polar', '3.00', '1', '2026-04-16 18:35:56', '2026-04-16 18:35:56');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('10', 'Mene Grande - el milagro', NULL, '2.00', '1', '2026-04-16 18:47:12', '2026-04-16 18:47:12');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('11', 'Mene Grande - la jurunga', NULL, '3.00', '1', '2026-04-16 18:52:33', '2026-04-16 18:52:33');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('12', 'Mene Grande - raya abajo', NULL, '4.00', '1', '2026-04-16 18:56:55', '2026-04-16 18:56:55');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('13', 'Mene Grande - raya arriba', NULL, '5.00', '1', '2026-04-16 18:58:15', '2026-04-16 18:58:15');
INSERT INTO `mototaxi_tarifas` (`id`, `nombre`, `descripcion`, `precio`, `activo`, `created_at`, `updated_at`) VALUES ('14', '___BASE_COMPRA___', 'Precio base por defecto para compra', '2.00', '1', '2026-04-17 01:26:57', '2026-04-17 01:27:06');

-- -----------------------------------------------
-- Tabla: `orders`
-- -----------------------------------------------
DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `id` char(36) NOT NULL,
  `cliente_id` varchar(255) NOT NULL,
  `cliente_nombre` varchar(255) DEFAULT NULL,
  `cliente_telefono` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `ubicacion_recogida` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ubicacion_recogida`)),
  `ubicacion_entrega` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ubicacion_entrega`)),
  `estado` varchar(255) NOT NULL,
  `motorizado_id` varchar(255) DEFAULT NULL,
  `motorizado_nombre` varchar(255) DEFAULT NULL,
  `motorizado_telefono` varchar(255) DEFAULT NULL,
  `aceptado_por_motorizado` tinyint(1) NOT NULL DEFAULT 0,
  `ubicacion_actual` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ubicacion_actual`)),
  `last_update` timestamp NULL DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20 registros en `orders`
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('3eyewqao7', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', NULL, 'mototaxi', 'Moto Taxi - Mene Grande los barrosos - Bs. 2.00', '{\"lat\":9.8213564000000008746837920625694096088409423828125,\"lng\":-70.9297968999999994821337168104946613311767578125,\"direccion\":\"Cc napole\"}', '{\"lat\":9.82635640000000165628080139867961406707763671875,\"lng\":-70.9247969000000040296072256751358509063720703125,\"direccion\":\"Frente a la escuela Marco tulio\"}', 'entregado', 'aa26f67f-2fa2-4af5-ba60-14c87f547618', 'Angel Garcia', NULL, '1', '{\"lat\":9.8214343999999993428673406015150249004364013671875,\"lng\":-70.929922500000003537934389896690845489501953125}', NULL, NULL, '2026-04-16 18:17:13', '2026-04-16 19:42:14');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('3l3hg9lr2', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', NULL, 'compra', 'PEDIDO ALMA ZULIANA  TERRAZA BAR: 1x CHURRO 2', '{\"lat\":10.4806000000000008043343768804334104061126708984375,\"lng\":-66.9035999999999972942532622255384922027587890625,\"direccion\":\"Local de ALMA ZULIANA  TERRAZA BAR\"}', '{\"lat\":9.8214327000000007927837941679172217845916748046875,\"lng\":-70.929848300000003291643224656581878662109375,\"direccion\":\"Direcci\\u00f3n de entrega no especificada\"}', 'en_camino', 'aa26f67f-2fa2-4af5-ba60-14c87f547618', 'Angel Garcia', NULL, '1', '{\"lat\":9.8459205000000000751469997339881956577301025390625,\"lng\":-70.928742900000003146487870253622531890869140625}', NULL, NULL, '2026-04-16 19:39:04', '2026-04-16 19:50:44');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('3ouwrtauh', 'b8d2c8e8-3855-4e65-bee4-dc9a884728e8', 'Cuenta Dibwe', NULL, 'compra', 'Bolsa de leche con pan dulce y nutella', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375,\"direccion\":\"Bella vista\"}', '{\"lat\":10.59440000000000026147972675971686840057373046875,\"lng\":-71.6140999999999934289007796905934810638427734375,\"direccion\":\"Manzanillo\"}', 'entregado', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-02 22:57:15', '2026-04-02 23:00:48');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('3zst9xpbs', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', NULL, 'recolección', 'Una hamburguesa en Pizzeria mg', '{\"lat\":9.8213819000000004422190613695420324802398681640625,\"lng\":-70.9297580000000067457222030498087406158447265625,\"direccion\":\"Pizzeria Mg\"}', '{\"lat\":9.831381900000000229056240641511976718902587890625,\"lng\":-70.91975800000000162981450557708740234375,\"direccion\":\"2 calle de rancho grande casa 10b donde el Prof Juan G\\u00f3mez\"}', 'entregado', '187b3a2a-385d-4032-96ee-c32b362c2349', 'javier castllo', NULL, '1', '{\"lat\":9.8215149999999997731947587453760206699371337890625,\"lng\":-70.9298232999999953563019516877830028533935546875}', NULL, NULL, '2026-04-09 21:19:10', '2026-04-09 21:28:46');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('67s5llqrn', 'ad3f4b6e-368b-4cf3-9c1c-c269f2cd8840', 'WebcincoDev', NULL, 'compra', 'casa', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375,\"direccion\":\"casa\"}', '{\"lat\":10.59440000000000026147972675971686840057373046875,\"lng\":-71.6140999999999934289007796905934810638427734375,\"direccion\":\"casa\"}', 'entregado', 'fa5a9854-0381-45a1-8158-d753e549a322', 'foras', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-03 00:24:31', '2026-04-03 21:24:57');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('7el4h4ykf', '24d2e106-82da-4095-a3cd-553d538e6795', 'Test User', NULL, 'compra', 'Comprar 2 kg de queso y 1 cart quesos y huevos.', '{\"direccion\":\"Mene Grande, Zulia\"}', '{\"direccion\":\"Bachaquero, Zulia\"}', 'entregado', 'a6e0a3d7-090d-439c-830b-84dd0ae2ba2f', 'Yericso Acosta', NULL, '1', NULL, NULL, NULL, '2026-04-10 13:59:30', '2026-04-11 15:51:38');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('9e1iplp68', 'guest_d4jqo1178', 'pedro pablo', '594003344', 'compra', 'Pedido Express a FRITOS MG: 1x Pollo, 1x Mixto', '{\"lat\":0,\"lng\":0,\"direccion\":\"FRITOS MG\"}', '{\"lat\":0,\"lng\":0,\"direccion\":\"varillal\"}', 'entregado', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', NULL, '0', NULL, NULL, NULL, '2026-04-02 16:48:44', '2026-04-02 22:59:00');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('abc123t', 'u1', 'Juan Test', '0991234567', 'envio', 'Paquete de prueba', '{\"lat\":10.1229999999999993320898283855058252811431884765625,\"lng\":-74.320999999999997953636921010911464691162109375,\"address\":\"Calle 1\"}', '{\"lat\":10.455999999999999516830939683131873607635498046875,\"lng\":-74.65399999999999636202119290828704833984375,\"address\":\"Calle 2\"}', 'entregado', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-02 13:52:49', '2026-04-02 16:49:08');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('fkbbifx44', '8b801e7a-77cd-44f5-8881-7031834be2a5', 'Nelly Muñoz', NULL, 'compra', 'cerveza', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375,\"direccion\":\"manzanillo\"}', '{\"lat\":10.59440000000000026147972675971686840057373046875,\"lng\":-71.6140999999999934289007796905934810638427734375,\"direccion\":\"los robles\"}', 'entregado', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', NULL, '0', NULL, NULL, NULL, '2026-04-05 23:38:44', '2026-04-05 23:40:06');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('iqf8cb6qq', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', NULL, 'compra', 'Compra pan y refresco en panadería Arturo y yula', '{\"lat\":9.8213290999999998120983946137130260467529296875,\"lng\":-70.9299850000000020600054995156824588775634765625,\"direccion\":\"Arturo y yula\"}', '{\"lat\":9.8263291000000005936954039498232305049896240234375,\"lng\":-70.9249850000000066074790083803236484527587890625,\"direccion\":\"2 calle de carorita\"}', 'entregado', 'a6e0a3d7-090d-439c-830b-84dd0ae2ba2f', 'Yericso Acosta', NULL, '1', '{\"lat\":9.82136080000000077916411100886762142181396484375,\"lng\":-70.92983820000000605432433076202869415283203125}', NULL, NULL, '2026-04-11 15:43:25', '2026-04-11 15:46:56');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('q6g3gsjbe', '8b801e7a-77cd-44f5-8881-7031834be2a5', 'Nelly Muñoz', NULL, 'recolección', 'Pollo', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375,\"direccion\":\"Los Robles\"}', '{\"lat\":10.59440000000000026147972675971686840057373046875,\"lng\":-71.6140999999999934289007796905934810638427734375,\"direccion\":\"Bella vista\"}', 'entregado', 'fa5a9854-0381-45a1-8158-d753e549a322', 'foras', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-05 23:41:23', '2026-04-05 23:44:00');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('sp3w9wc8u', 'guest_pszfh5h4e', 'eeeer', '4444', 'compra', 'Pedido Express a Burger Master Exprés: 1x Hamburguesa Smash', '{\"lat\":0,\"lng\":0,\"direccion\":\"Burger Master Expr\\u00e9s\"}', '{\"lat\":0,\"lng\":0,\"direccion\":\"4444\"}', 'entregado', 'fa5a9854-0381-45a1-8158-d753e549a322', 'foras', NULL, '0', NULL, NULL, NULL, '2026-04-02 15:51:40', '2026-04-02 16:09:53');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('test12345', 'test', 'Test', '123', 'envio', 'Test', NULL, NULL, 'entregado', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-02 13:43:04', '2026-04-09 20:48:27');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('tpjk6pp3k', '8b801e7a-77cd-44f5-8881-7031834be2a5', 'Nelly Muñoz', NULL, 'recolección', 'Farmacia', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375,\"direccion\":\"Manzanillo\"}', '{\"lat\":10.59440000000000026147972675971686840057373046875,\"lng\":-71.6140999999999934289007796905934810638427734375,\"direccion\":\"Bella vista\"}', 'entregado', 'fa5a9854-0381-45a1-8158-d753e549a322', 'foras', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-03 21:26:18', '2026-04-05 23:41:58');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('tun1un3zu', '070637a2-1171-438d-9b53-dd98c8523f2b', 'jose bacan', NULL, 'recolección', 'computador', '{\"lat\":10.4806000000000008043343768804334104061126708984375,\"lng\":-66.9035999999999972942532622255384922027587890625,\"direccion\":\"varillal\"}', '{\"lat\":10.490600000000000591171556152403354644775390625,\"lng\":-66.8935999999999921783455647528171539306640625,\"direccion\":\"manzanillo\"}', 'entregado', 'fa5a9854-0381-45a1-8158-d753e549a322', 'foras', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-02 17:06:10', '2026-04-03 16:23:14');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('v9ght53o5', '672ecbed-a786-47a0-8886-8a9916315218', 'Test User', NULL, 'compra', 'red', '{\"direccion\":\"Mene Grande, Venezuela\"}', '{\"direccion\":\"Caracas, Venezuela\"}', 'entregado', 'a6e0a3d7-090d-439c-830b-84dd0ae2ba2f', 'Yericso Acosta', NULL, '1', '{\"lat\":9.82133639999999985548129188828170299530029296875,\"lng\":-70.9299893000000025722329155541956424713134765625}', NULL, NULL, '2026-04-10 14:42:05', '2026-04-11 15:51:28');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('wazswvrv4', '9f49a888-1551-4742-b4dc-fa820d64654b', 'Armando ovalle', NULL, 'compra', 'COMIDA', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375,\"direccion\":\"MANZANILLO\"}', '{\"lat\":10.59440000000000026147972675971686840057373046875,\"lng\":-71.6140999999999934289007796905934810638427734375,\"direccion\":\"BELLA VISTA\"}', 'entregado', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', NULL, '1', NULL, NULL, NULL, '2026-04-02 15:49:17', '2026-04-02 16:07:37');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('wokuuljv2', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', NULL, 'recolección', 'Comprar 2 panes y una coca cola', '{\"lat\":9.821399400000000667887434246949851512908935546875,\"lng\":-70.9298880000000053769326768815517425537109375,\"direccion\":\"Panader\\u00eda factoria\"}', '{\"lat\":9.8313994000000004547246135189197957515716552734375,\"lng\":-70.9198880000000002610249794088304042816162109375,\"direccion\":\"Centro comercial napole\"}', 'entregado', 'fa5a9854-0381-45a1-8158-d753e549a322', 'foras', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-08 13:03:58', '2026-04-08 13:47:49');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('xgkogmrkw', '8b801e7a-77cd-44f5-8881-7031834be2a5', 'Nelly Muñoz', NULL, 'compra', 'arroz por bulto', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375,\"direccion\":\"manzanillo\"}', '{\"lat\":10.59440000000000026147972675971686840057373046875,\"lng\":-71.6140999999999934289007796905934810638427734375,\"direccion\":\"la rotaria\"}', 'entregado', 'fa5a9854-0381-45a1-8158-d753e549a322', 'foras', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-02 16:34:23', '2026-04-02 16:39:48');
INSERT INTO `orders` (`id`, `cliente_id`, `cliente_nombre`, `cliente_telefono`, `tipo`, `descripcion`, `ubicacion_recogida`, `ubicacion_entrega`, `estado`, `motorizado_id`, `motorizado_nombre`, `motorizado_telefono`, `aceptado_por_motorizado`, `ubicacion_actual`, `last_update`, `timestamp`, `created_at`, `updated_at`) VALUES ('xo1igx7rg', 'guest_mmyf40hr8', 'nuevo ovalle', '4444444', 'compra', 'Pedido Express a FRITOS MG: 1x LOMITO, 1x Pollo, 1x Mixto', '{\"lat\":0,\"lng\":0,\"direccion\":\"FRITOS MG\"}', '{\"lat\":0,\"lng\":0,\"direccion\":\"robles\"}', 'entregado', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', NULL, '1', '{\"lat\":10.5844000000000004746425474877469241619110107421875,\"lng\":-71.6240999999999985448084771633148193359375}', NULL, NULL, '2026-04-02 17:03:16', '2026-04-08 14:39:48');

-- -----------------------------------------------
-- Tabla: `password_reset_tokens`
-- -----------------------------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (tabla vacía)

-- -----------------------------------------------
-- Tabla: `sessions`
-- -----------------------------------------------
DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15 registros en `sessions`
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('15veFZ1Io7XcHgZD2AbY03IGdSbFM3cWKYC5MrRT', NULL, '186.165.208.39', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQVZmaFFXV0hyMlVLYU10WFQ5Tk52WjRGOEhzRHVjdlhWUVpXN2g1WCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775926291');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('2FFgowNaE6sRdJAdY0OkfuFmq5TS8b2D3VyzQrWl', NULL, '190.97.234.185', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMElISm55ZXY5dTZSc29KaEFBRnptZEdPNU05QzhzaURhMGNoMkhpViI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775921311');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('2YN1CZOlzs5DnFneJkBacKvXhqKLjepzjTGkFHg2', NULL, '38.43.248.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOEplQTVyZkYzZzB3ZVVJODJGZ3UxdnJpVExTWUVnY3lxOWFaeXJnNiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1776276400');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('aSYL2rUbWvSR4jKz5ukF9kC72KGI5d0UHEyJ2eN4', NULL, '186.167.233.66', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWFhPQk56RThqVWFkbUgyeEpidG9tZ3A2T0dSQkxrbW45SDFRazA3byI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1776107373');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('dRc3uvAA35D8I8LOCM259FoB85NfIy6WuQP4aM75', NULL, '66.102.8.35', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ1ljWnRhZllIaTAzN1d5YkduMFVDZEE2WGNGdkNTUHRFck1McmxNYyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775921933');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('GMp7yEy6HnE6pkoOrFK5C4yjXmETCPljR1Az0uw1', NULL, '38.43.248.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoianNXMG1FblEyM01UMFQ1ZDdzUWFER2FKa2kzR1RGZnZMRlozdHdiaiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1776275849');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('H1RJJ1SCsh6FLJ5mgDcR1BcznCXDaZJ0ogdEsecv', NULL, '190.97.234.185', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQWN6aks2RHdiT1J0ekVhOXRCNjJWSHk3UGhUV0pRaHk3NFQxWkV1SiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775921991');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('OPEjURjHfUjdJqNDbXPbgGQZ7oaTAtlcGQ5PiOMN', NULL, '190.97.234.185', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZW1qTmdMM3lPT0JiRDkwWXdtZzI0cTBaa0VHOGZ4bW9KTGFHaVVNViI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775936897');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('OXZXtgX5mFyAk1u9FJDBR59cDIUrB9N0G4LkIwdG', NULL, '190.97.234.185', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVm5sWXNEWWZUWkxyZEdFWTVDd3ljbEFtTVE5NUpjYURPbmNEbkl3NiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775935819');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('rIw6oLSUo0yOHyQSVbL6hKlD2PPpeWfsFm0TEwWA', NULL, '135.148.55.132', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoib0E5RWl4OGhTamhQa3pTMEtUck12WnZYZU15QzZvSFd5Q3BnNDJ5cyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1776271172');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('rqL2p5r03f2vMkb9CrveulIGK2RO52PYKF06pynA', NULL, '66.102.8.35', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN0wyZHN4NkFTMmdNM3k3WmhYQ05aQWJheGFHQ2xOUHl6dVFqOVIydiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775921933');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('u35pFlaaGggk3aPklmb7w3QuJr5H3uRJ4OGfLpE7', NULL, '190.97.234.186', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoialQxR2x1Tk41MkpEUkFGUXhxWG1nTmxmQ1VURncxVVVqaDRTTno4WiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1776127502');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('xouNwoCU8QBCLdZbfKECo7nbGmuXvUdOKWrW1ECM', NULL, '66.102.8.35', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUE1BRW9iUHloOU9meDNxTTFlMUE0UlZUamdWcUdkS0tXQlFFdENNMiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775921933');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('YLa9AXuQ8lRznCg5RYEQ2bToPTFMQMYRrRRdf0Jp', NULL, '38.43.248.75', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV1lGU2RvS0VNS0VJSzZGTE1ma29YN3JYalRkQUJ6bmJudGFBOWNJMiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1776223563');
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('ZSoc6DxxqrlVciDSPCgStN1tq8VqpsgD1XPyZurY', NULL, '190.97.234.185', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoia0RNUG9Td2VBN2Y5eHc5aG1IbHJhdXJHMk1Ba2FCWXp2Smw0REF6UCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vd3d3LndlYmNpbmNvZGV2LmNvbS9iMmIvcHVibGljIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', '1775921989');

-- -----------------------------------------------
-- Tabla: `users`
-- -----------------------------------------------
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `rol` varchar(255) NOT NULL DEFAULT 'cliente',
  `fcmToken` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `tipoVehiculo` varchar(255) DEFAULT NULL,
  `placaVehiculo` varchar(255) DEFAULT NULL,
  `documentoId` varchar(255) DEFAULT NULL,
  `fotoUrl` text DEFAULT NULL,
  `disponible` tinyint(1) NOT NULL DEFAULT 1,
  `ocupado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_uid_unique` (`uid`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20 registros en `users`
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('070637a2-1171-438d-9b53-dd98c8523f2b', '070637a2-1171-438d-9b53-dd98c8523f2b', 'jose bacan', 'cliente1@hotmail.com', '$2y$12$Hq6m7vxWX1jFIFr62w0NWeXYPMyXsrdLiM7RGWq.3e9HmdzWRuaM2', 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-02 17:05:34', '2026-04-02 17:05:34');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('0dda51f1-93dc-4ba8-9c84-34f95351336c', '0dda51f1-93dc-4ba8-9c84-34f95351336c', 'John gomez John gomez', 'johngomez188@gmail.com', NULL, 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-08 12:58:38', '2026-04-16 21:19:51');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('187b3a2a-385d-4032-96ee-c32b362c2349', '187b3a2a-385d-4032-96ee-c32b362c2349', 'Javier Castillo', 'castilloperezjj2011@gmail.com', '$2y$12$1nIlYrS.iurD9cXvg/NVP.SqFaGotj7ba4ADVMkPDOreddsmJDSd.', 'motorizado', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-09 20:55:47', '2026-04-11 19:31:19');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('24d2e106-82da-4095-a3cd-553d538e6795', '24d2e106-82da-4095-a3cd-553d538e6795', 'Test User', 'test@test.com', '$2y$12$WcHT93XIyikywtAIDDidG.smk5IYmnCfkmox9asCAGyPRSL1Pl9oi', 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-10 13:57:11', '2026-04-10 13:57:11');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('269f1b7a-7003-4c9e-8be4-46db063ca110', '269f1b7a-7003-4c9e-8be4-46db063ca110', 'armansdo', 'webcincode3v@gmail.com', '$2y$12$6VpnU9FbCVP2uPG/MfxyhundxsEo7Y11u1mjS9QZScKQD4IQ764jG', 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-03 00:26:14', '2026-04-03 00:26:14');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('38bb5024-0a86-479a-8035-df697c5cae18', '38bb5024-0a86-479a-8035-df697c5cae18', 'Test User', 'test@gmail.com', NULL, 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-01 23:49:39', '2026-04-01 23:49:39');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('44c7c84c-f116-4425-a009-24cb9693708d', '44c7c84c-f116-4425-a009-24cb9693708d', 'holarepa', 'repa1@delivery.com', '$2y$12$MN17QGUj3obpHeMxHas3q.VZU/rcwNT0ebP8Ax7yFPngnlgIzJ7ZG', 'motorizado', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-02 16:06:51', '2026-04-09 20:48:27');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('672ecbed-a786-47a0-8886-8a9916315218', '672ecbed-a786-47a0-8886-8a9916315218', 'Test User', 'test@example.com', '$2y$12$yqnTp0HYPI/D9JY/mVq8xevWmcOMxn1Yq7cT7yipsXN8xFD/i.U2q', 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-10 14:39:38', '2026-04-10 14:39:38');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('75378548-0fbd-496c-8b3f-ed62fbe8134f', '75378548-0fbd-496c-8b3f-ed62fbe8134f', 'Jhon gomez', 'john@delivery.com', '$2y$12$8DfQYVcEmJosNin9s/Qk/OgmvmNePFaLqRmKgS5lEZbEC/I75sxme', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-08 13:23:56', '2026-04-08 13:23:56');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('76561f45-abeb-4224-baa1-9c9766310809', '76561f45-abeb-4224-baa1-9c9766310809', 'Xaviela Ovalle', 'xavielaovalleromero@gmail.com', NULL, 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-02 22:54:44', '2026-04-02 22:54:44');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('8b801e7a-77cd-44f5-8881-7031834be2a5', '8b801e7a-77cd-44f5-8881-7031834be2a5', 'Nelly Muñoz', 'strongmeropower@gmail.com', NULL, 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-02 15:12:04', '2026-04-16 01:57:26');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('9f49a888-1551-4742-b4dc-fa820d64654b', '9f49a888-1551-4742-b4dc-fa820d64654b', 'Armando ovalle', 'webcincodias@gmail.com', NULL, 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-01 23:50:15', '2026-04-15 20:36:36');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('a6e0a3d7-090d-439c-830b-84dd0ae2ba2f', 'a6e0a3d7-090d-439c-830b-84dd0ae2ba2f', 'Yericso Acosta', 'francescochamo1@gmail.com', '$2y$12$Xqj8Vw2ckKuwJYwS26tunOtms4sXT2qQHCp7kFzyRitsmjkVVNx2S', 'motorizado', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-11 15:35:17', '2026-04-11 15:51:38');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('aa26f67f-2fa2-4af5-ba60-14c87f547618', 'aa26f67f-2fa2-4af5-ba60-14c87f547618', 'Angel Garcia', 'a25308191@gmail.com', '$2y$12$48EMVsRSm.iIzBv7SE29PuDQKksVICyo0HMgs2fxR2Q4xnr5Knn6S', 'motorizado', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-11 15:37:10', '2026-04-16 19:48:52');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('ad3f4b6e-368b-4cf3-9c1c-c269f2cd8840', 'ad3f4b6e-368b-4cf3-9c1c-c269f2cd8840', 'WebcincoDev', 'webcincodev@gmail.com', NULL, 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-03 00:00:04', '2026-04-16 01:28:10');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('b8d2c8e8-3855-4e65-bee4-dc9a884728e8', 'b8d2c8e8-3855-4e65-bee4-dc9a884728e8', 'Cuenta Dibwe', 'dibweb938@gmail.com', NULL, 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-01 23:50:55', '2026-04-02 22:56:42');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('f90327df-bb72-41a3-84e8-af0bd7076495', 'f90327df-bb72-41a3-84e8-af0bd7076495', 'Super Admin', 'admin@delivery.com', '$2y$12$yEPlEBM0nRZiIfrwQqWGv.6dBPkt5aSKG9DEY2oV.LsE.ZgNRu7Oi', 'admin', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-02 15:39:18', '2026-04-02 15:39:18');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('fa5a9854-0381-45a1-8158-d753e549a322', 'fa5a9854-0381-45a1-8158-d753e549a322', 'foras', 'admi2n@delivery.com', '$2y$12$H57ZEQ43C5K.AHD4O53UuuHo8okiyGi3m19SNDa/8nBiXCP3Ws/2G', 'motorizado', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-02 00:02:11', '2026-04-08 13:47:49');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('fc1699b5-8e0a-4eef-9ae9-93d3433b5b80', 'fc1699b5-8e0a-4eef-9ae9-93d3433b5b80', 'Conductor Demo', 'moto@delivery.com', '$2y$12$xHUn0jzV5u7RC7Q8OyHc2u1Stm6APqVa3RQmNiGvUnvuJhgyNp.Y.', 'motorizado', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-01 23:56:18', '2026-04-01 23:56:18');
INSERT INTO `users` (`id`, `uid`, `nombre`, `email`, `password`, `rol`, `fcmToken`, `telefono`, `tipoVehiculo`, `placaVehiculo`, `documentoId`, `fotoUrl`, `disponible`, `ocupado`, `created_at`, `updated_at`) VALUES ('fced71f6-ac9a-469b-a106-bb31ddbf2b25', 'fced71f6-ac9a-469b-a106-bb31ddbf2b25', 'Javier Castillo', 'castilloperezjj2011.respaldo@gmail.com', NULL, 'cliente', NULL, NULL, NULL, NULL, NULL, NULL, '1', '0', '2026-04-11 19:31:59', '2026-04-11 19:31:59');

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Exportación completada: 13 tablas, 85 registros totales
-- =============================================
