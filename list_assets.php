<?php
header('Content-Type: text/plain');
$dir = __DIR__ . '/assets';
if (!is_dir($dir)) {
    echo "Directory 'assets' does not exist.\n";
    exit;
}
$files = scandir($dir);
foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;
    echo $file . "\n";
}
