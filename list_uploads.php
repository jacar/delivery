<?php
$dir = '/home2/delivery/storage/app/public/uploads';
echo "Contenido de $dir:<br>";
if (is_dir($dir)) {
    print_r(scandir($dir));
} else {
    echo "EL DIRECTORIO NO EXISTE";
}
?>
