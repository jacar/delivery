<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$envFile = __DIR__ . '/../.env';
echo "<h1>Diagnóstico de Conexión</h1>";
echo "Buscando .env en: " . realpath($envFile) . "<br>";

if (file_exists($envFile)) {
    echo "✅ Archivo .env encontrado.<br>";
    $content = file_get_contents($envFile);
    if ($content === false) {
        echo "❌ No se puede leer el contenido del .env (permisos).<br>";
    } else {
        echo "✅ Contenido del .env leído (" . strlen($content) . " bytes).<br>";
    }
} else {
    echo "❌ Archivo .env NO encontrado.<br>";
}

// ... resto del código corregido para mayor robustez
try {
    // Intento directo con variables crudas para probar credenciales manuales si fallan las del env
    $host = 'localhost';
    $database = 'delivery_lara522';
    $username = 'delivery_lara522';
    $password = 'Forastero_938';
    
    echo "Probando conexión manual con user: $username...<br>";
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    echo "✅ CONEXIÓN MANUAL EXITOSA.<br>";
} catch (PDOException $e) {
    echo "❌ FALLO CONEXIÓN MANUAL: " . $e->getMessage() . "<br>";
}
?>
