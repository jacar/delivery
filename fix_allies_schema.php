<?php
/**
 * Script de Reparación de DB (Versión Independiente)
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');

// Intentar leer el .env
$env = [];
if (file_exists(__DIR__ . '/.env')) {
    $lines = explode("\n", file_get_contents(__DIR__ . '/.env'));
    foreach ($lines as $line) {
        if (trim($line) == '' || strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $env[trim($parts[0])] = trim(trim($parts[1]), "\" '");
        }
    }
}

$host = $env['DB_HOST'] ?? 'localhost';
$db   = $env['DB_DATABASE'] ?? 'delivery_db';
$user = $env['DB_USERNAME'] ?? 'delivery_user';
$pass = $env['DB_PASSWORD'] ?? '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "¡Conexión DB Exitosa!\n";

    // 1. ownerEmail
    try {
        $pdo->exec("ALTER TABLE allies ADD COLUMN ownerEmail VARCHAR(255) NULL AFTER id");
        echo "[OK] Columna 'ownerEmail' añadida.\n";
    } catch (Exception $e) {
        echo "[INFO] ownerEmail: " . $e->getMessage() . "\n";
    }

    // 2. aprobado
    try {
        $pdo->exec("ALTER TABLE allies ADD COLUMN aprobado TINYINT(1) DEFAULT 0 AFTER ownerEmail");
        echo "[OK] Columna 'aprobado' añadida.\n";
    } catch (Exception $e) {
        echo "[INFO] aprobado: " . $e->getMessage() . "\n";
    }

    // 3. Modificar ID a VARCHAR
    try {
        $pdo->exec("ALTER TABLE allies MODIFY COLUMN id VARCHAR(255) NOT NULL");
        echo "[OK] ID convertido a VARCHAR(255).\n";
    } catch (Exception $e) {
        echo "[ERROR] Modificando ID: " . $e->getMessage() . "\n";
    }

    echo "\nProceso finalizado.";

} catch (Exception $e) {
    die("Error Crítico: " . $e->getMessage());
}
