<?php
header('Content-Type: text/plain');

function rrmdir($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object))
                    rrmdir($dir. DIRECTORY_SEPARATOR .$object);
                else
                    unlink($dir. DIRECTORY_SEPARATOR .$object);
            }
        }
        rmdir($dir);
    }
}

echo "Cleaning assets folder...\n";
rrmdir(__DIR__ . '/assets');
mkdir(__DIR__ . '/assets', 0755);

$zipFile = 'dist_v4.zip';
if (!file_exists($zipFile)) {
    echo "ZIP MISSING: $zipFile\n";
    exit;
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    echo "ZIP OPENED. Extracting...\n";
    if ($zip->extractTo('./')) {
        echo "EXTRACTION SUCCESSFUL.\n";
    } else {
        echo "EXTRACTION FAILED.\n";
    }
    $zip->close();
} else {
    echo "FAILED TO OPEN ZIP.\n";
}

echo "\nVerifying index-BnMLwBlx.js:\n";
$target = __DIR__ . '/assets/index-BnMLwBlx.js';
if (file_exists($target)) {
    echo "EXISTS! Size: " . filesize($target) . "\n";
} else {
    echo "STILL MISSING.\n";
}
