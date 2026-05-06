<?php
header('Content-Type: text/plain');
$zipFile = 'dist_v4.zip';
if (!file_exists($zipFile)) {
    echo "ZIP MISSING\n";
    exit;
}
$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    echo "ZIP OPENED. File count: " . $zip->numFiles . "\n";
    for($i = 0; $i < min(100, $zip->numFiles); $i++) {
        echo $zip->getNameIndex($i) . "\n";
    }
    if ($zip->numFiles > 100) echo "... and more\n";
    
    $index = $zip->locateName('assets/index-BnMLwBlx.js');
    if ($index !== false) {
        echo "\nFOUND IN ZIP: assets/index-BnMLwBlx.js at index $index\n";
    } else {
        echo "\nNOT FOUND IN ZIP: assets/index-BnMLwBlx.js\n";
    }
    $zip->close();
} else {
    echo "FAILED TO OPEN ZIP\n";
}
