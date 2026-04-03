<?php
// Este script está en /public. El ZIP está en la raíz.
$zipFile = '../fotogramas.zip';
$extractPath = './fotogramas';

if (!file_exists($zipFile)) {
    die("ERROR: fotogramas.zip not found at $zipFile");
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    if (!is_dir($extractPath)) {
        if (!mkdir($extractPath, 0777, true)) {
            die("ERROR: Could not create directory $extractPath");
        }
    }
    
    $zip->extractTo($extractPath);
    $zip->close();
    echo "SUCCESS: Extracted to $extractPath (public/fotogramas)";
} else {
    echo "ERROR: Could not open $zipFile";
}
?>
