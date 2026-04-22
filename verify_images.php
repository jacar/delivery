<?php
header('Content-Type: application/json');

$files = [
    'storage/uploads/l2CiWAs7VJwpfqw0YfIGmqCta7udxdBSRzvt5dpb.png',
    'storage/uploads/X6zBNOlnt8UNaUATmPPis2ONYuChGOuTbRafOYwT.jpg',
    'storage/uploads/HIerkonnsiKL6SsmVjGQmx3AiSMhqTHPvc5towDa.jpg',
    'storage/uploads/kmfrcHUTVxhoDz06W5nuKUx8jeHlpWqWY4Rso5BN.png',
    'storage/uploads/Hgzo8utJWAp0KORfBmopH8g9ivM6KoSbrRgieE5t.png'
];

$results = [];
foreach ($files as $file) {
    // Verificamos si el archivo existe desde la perspectiva de public_html
    $results[$file] = [
        'exists' => file_exists($file),
        'readable' => is_readable($file),
        'size' => file_exists($file) ? filesize($file) : 0
    ];
}

// Verificamos el enlace simbólico storage
$results['symlink_check'] = [
    'is_link' => is_link('storage'),
    'target' => is_link('storage') ? readlink('storage') : 'NOT A LINK'
];

echo json_encode($results, JSON_PRETTY_PRINT);
?>
