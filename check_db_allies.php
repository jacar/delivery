<?php
header('Content-Type: text/plain');
$baseDir = dirname(__DIR__); // Uno arriba de public_html
require $baseDir . '/vendor/autoload.php';
$app = require_once $baseDir . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $allies = \Illuminate\Support\Facades\DB::table('allies')->get();
    foreach ($allies as $ally) {
        echo "ID: " . $ally->id . " | Name: " . $ally->nombre . " | Aprobado: " . ($ally->aprobado ? 'YES' : 'NO') . " | Email: " . $ally->ownerEmail . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
