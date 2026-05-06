<?php
/**
 * Parcheador de CSRF para API
 * Este script actualiza bootstrap/app.php para ignorar CSRF en rutas de API.
 */
header('Content-Type: text/plain');

$app_file = __DIR__ . '/../bootstrap/app.php';
if (!file_exists($app_file)) {
    // Intentar asumiendo que estamos en public_html
    $app_file = __DIR__ . '/bootstrap/app.php';
}

if (!file_exists($app_file)) {
    die("❌ Error: No se encontró el archivo bootstrap/app.php");
}

$content = file_get_contents($app_file);

// Si ya tiene la exclusión, no hacer nada
if (strpos($content, "'api/*'") !== false) {
    echo "✅ El archivo bootstrap/app.php ya tiene la exclusión de CSRF para la API.\n";
    exit;
}

// Buscar el bloque withMiddleware y añadir la validación de CSRF
$pattern = '/->withMiddleware\(function\s*\(\w+\s*\$middleware\)\s*\{/';
$replacement = "->withMiddleware(function (Middleware \$middleware) {\n        \$middleware->validateCsrfTokens(except: [\n            'api/*',\n        ]);";

if (preg_match($pattern, $content)) {
    $new_content = preg_replace($pattern, $replacement, $content);
    
    // Asegurarse de que 'use Illuminate\Foundation\Configuration\Middleware;' esté presente
    if (strpos($new_content, 'use Illuminate\Foundation\Configuration\Middleware;') === false) {
        $new_content = str_replace(
            "use Illuminate\Foundation\Application;",
            "use Illuminate\Foundation\Application;\nuse Illuminate\Foundation\Configuration\Middleware;",
            $new_content
        );
    }

    if (file_put_contents($app_file, $new_content)) {
        echo "✅ bootstrap/app.php actualizado con éxito. Las rutas /api/* ahora están excluidas de CSRF.\n";
    } else {
        echo "❌ Error al escribir en $app_file\n";
    }
} else {
    echo "❌ No se pudo encontrar el bloque withMiddleware en bootstrap/app.php.\n";
    echo "Contenido actual:\n\n$content";
}
