<?php
header('Content-Type: text/plain');
$file = __DIR__ . '/assets/index-BnMLwBlx.js';
if (file_exists($file)) {
    echo "FILE EXISTS: index-BnMLwBlx.js\n";
    echo "SIZE: " . filesize($file) . " bytes\n";
    echo "MIME: " . mime_content_type($file) . "\n";
} else {
    echo "FILE MISSING: index-BnMLwBlx.js\n";
}
