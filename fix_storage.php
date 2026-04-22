<?php
// Script FORCE para recrear el enlace simbólico
$target = '/home2/delivery/storage/app/public';
$link = $_SERVER['DOCUMENT_ROOT'] . '/storage';

echo "Configuración:<br>";
echo "Target: $target<br>";
echo "Link: $link<br><br>";

if (file_exists($link) || is_link($link)) {
    echo "Eliminando enlace/archivo existente...<br>";
    if (is_dir($link) && !is_link($link)) {
        rename($link, $link . '_old_' . time());
    } else {
        unlink($link);
    }
}

if (symlink($target, $link)) {
    echo "¡Enlace simbólico RECREADO con éxito!<br>";
} else {
    echo "ERROR crítico al crear el enlace simbólico.";
    $error = error_get_last();
    echo "<br>Detalle: " . $error['message'];
}

// Verificar si el archivo de un aliado es accesible a través del link
$testFile = $link . '/uploads/l2CiWAs7VJwpfqw0YfIGmqCta7udxdBSRzvt5dpb.png';
if (file_exists($testFile)) {
    echo "<br><br>✅ TEST EXITOSO: El archivo de prueba fue encontrado a través del enlace.";
} else {
    echo "<br><br>❌ TEST FALLIDO: No se encuentra el archivo en $testFile";
    // Listar qué hay en el target
    echo "<br>Contenido del target ($target):<br>";
    print_r(scandir($target));
}
?>
