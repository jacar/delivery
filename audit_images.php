<?php
// audit_images.php - Auditoría de integridad de archivos
header('Content-Type: application/json');

$config = [
    'host' => '127.0.0.1',
    'db'   => 'delivery_lara522',
    'user' => 'delivery_lara522',
    'pass' => 'Forastero_938',
    'charset' => 'utf8mb4',
];

$results = [
    'db_connection' => false,
    'total_allies' => 0,
    'missing_images' => [],
    'found_images' => [],
    'storage_path' => '/home2/delivery/storage/app/public/uploads',
    'public_path' => '/home2/delivery/public_html/storage/uploads'
];

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['user'], $config['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $results['db_connection'] = true;

    $stmt = $pdo->query("SELECT id, nombre, logoUrl, imagenes FROM allies");
    $allies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $results['total_allies'] = count($allies);

    foreach ($allies as $aliado) {
        // 1. Verificar logoUrl
        if ($aliado['logoUrl']) {
            $filename = basename($aliado['logoUrl']);
            $localPath = $results['storage_path'] . '/' . $filename;
            
            if (file_exists($localPath)) {
                $results['found_images'][] = "Logo: $filename ({$aliado['nombre']})";
            } else {
                $results['missing_images'][] = [
                    'aliado' => $aliado['nombre'],
                    'type' => 'logo',
                    'filename' => $filename,
                    'expected_path' => $localPath
                ];
            }
        }

        // 2. Verificar imagenes (JSON)
        if ($aliado['imagenes']) {
            $imgs = json_decode($aliado['imagenes'], true);
            if (is_array($imgs)) {
                foreach ($imgs as $imgUrl) {
                    $filename = basename($imgUrl);
                    $localPath = $results['storage_path'] . '/' . $filename;
                    if (file_exists($localPath)) {
                        $results['found_images'][] = "Gallery Item: $filename";
                    } else {
                        $results['missing_images'][] = [
                            'aliado' => $aliado['nombre'],
                            'type' => 'gallery',
                            'filename' => $filename,
                            'expected_path' => $localPath
                        ];
                    }
                }
            }
        }
    }

    // 3. Búsqueda de archivos "huérfanos" para ver si están en otra carpeta
    $results['orphan_check'] = "Iniciada búsqueda de carpetas alternativas...";
    $potential_paths = [
        '/home2/delivery/public_html/uploads',
        '/home2/delivery/public_html/storage/uploads',
        '/home2/delivery/public/storage/uploads',
        '/home2/delivery/storage/uploads'
    ];
    $results['alternative_locations'] = [];

    foreach ($potential_paths as $path) {
        if (is_dir($path)) {
            $files = scandir($path);
            $results['alternative_locations'][$path] = count($files) - 2; // -2 por . y ..
        }
    }

} catch (Exception $e) {
    $results['error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
