<?php
// audit_list.php - Listar archivos reales para comparar
header('Content-Type: application/json');

$dir = '/home2/delivery/storage/app/public/uploads';
$files = [];
if (is_dir($dir)) {
    $files = scandir($dir);
}

// También buscamos en 'public/storage' directamente por si acaso
$dir2 = '/home2/delivery/public_html/storage/uploads';
$files2 = [];
if (is_dir($dir2)) {
    $files2 = scandir($dir2);
}

echo json_encode([
    'storage_uploads' => $files,
    'public_html_storage_uploads' => $files2,
    'current_symlink_info' => is_link('/home2/delivery/public_html/storage') ? readlink('/home2/delivery/public_html/storage') : 'NOT A LINK'
], JSON_PRETTY_PRINT);
?>
