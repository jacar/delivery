<?php
/**
 * Script temporal para crear la tabla mototaxi_tarifas
 * USAR UNA SOLA VEZ y luego eliminar del servidor
 */

// Cargar las variables de entorno de Laravel
$envFile = __DIR__ . '/../.env';
$env = [];
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            $env[trim($key)] = trim($value, " \"'");
        }
    }
}

$host   = $env['DB_HOST']     ?? 'localhost';
$dbname = $env['DB_DATABASE'] ?? '';
$user   = $env['DB_USERNAME'] ?? '';
$pass   = $env['DB_PASSWORD'] ?? '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "CREATE TABLE IF NOT EXISTS `mototaxi_tarifas` (
        `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
        `nombre`      VARCHAR(150) NOT NULL,
        `descripcion` TEXT NULL,
        `precio`      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        `activo`      TINYINT(1) NOT NULL DEFAULT 1,
        `created_at`  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at`  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);
    echo json_encode([
        'success' => true,
        'message' => 'Tabla mototaxi_tarifas creada exitosamente.',
        'db'      => $dbname
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage()
    ]);
}
