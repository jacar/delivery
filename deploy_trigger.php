<?php
$zip = new ZipArchive;
if ($zip->open('dist_v4.zip') === TRUE) {
    $zip->extractTo('./');
    $zip->close();
    echo "Frontend Extracted Successfully.<br>";
} else {
    echo "Frontend Extraction Failed.<br>";
}

// Ahora ejecutar el parche de backend
include 'patch_backend.php';

// Limpiar archivos subidos
unlink('dist_v4.zip');
unlink('patch_backend.php');
unlink(__FILE__);
echo "Deployment Complete.";
?>
