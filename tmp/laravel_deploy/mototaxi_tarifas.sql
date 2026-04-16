-- =====================================================
-- TABLA: mototaxi_tarifas
-- Ejecutar este SQL en phpMyAdmin del cPanel
-- =====================================================

CREATE TABLE IF NOT EXISTS `mototaxi_tarifas` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`      VARCHAR(150) NOT NULL,
  `descripcion` TEXT NULL,
  `precio`      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `activo`      TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de ejemplo (opcional, puedes borrarlos)
INSERT INTO `mototaxi_tarifas` (`nombre`, `descripcion`, `precio`, `activo`) VALUES
('Zona Urbana',   'Traslado dentro del área urbana principal',         5.00, 1),
('Zona Periférica','Traslado hacia zonas periféricas de la ciudad',    8.00, 1),
('Viaje Especial','Rutas largas o fuera del perímetro habitual',      15.00, 1);
