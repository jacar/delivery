<?php
header('Content-Type: text/plain');
echo "CWD: " . getcwd() . "\n";
echo "DIR: " . __DIR__ . "\n";
$assetsDir = __DIR__ . '/assets';
if (is_dir($assetsDir)) {
    echo "ASSETS DIR EXISTS\n";
    $files = scandir($assetsDir);
    print_r($files);
} else {
    echo "ASSETS DIR MISSING\n";
}
