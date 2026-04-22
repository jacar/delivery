<?php
// find_lost_images.php - Búsqueda global en el servidor
header('Content-Type: application/json');

$filenames = [
    'l2CiWAs7VJwpfqw0YfIGmqCta7udxdBSRzvt5dpb.png',
    'X6zBNOlnt8UNaUATmPPis2ONYuChGOuTbRafOYwT.jpg',
    'HIerkonnsiKL6SsmVjGQmx3AiSMhqTHPvc5towDa.jpg',
    'kmfrcHUTVxhoDz06W5nuKUx8jeHlpWqWY4Rso5BN.png',
    'Hgzo8utJWAp0KORfBmopH8g9ivM6KoSbrRgieE5t.png'
];

$searchRoot = '/home2/delivery';
$found = [];

function searchFiles($dir, $filenames, &$found) {
    if (!is_dir($dir)) return;
    
    // Evitar carpetas de sistema o muy pesadas si es necesario, 
    // pero aquí queremos ser exhaustivos.
    $items = @scandir($dir);
    if (!$items) return;

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $path = $dir . '/' . $item;
        
        if (is_dir($path)) {
            // No entrar en carpetas de cache o temporales obvias
            if ($item !== 'vendor' && $item !== 'node_modules' && $item !== '.git' && $item !== 'cache') {
                searchFiles($path, $filenames, $found);
            }
        } else {
            if (in_array($item, $filenames)) {
                $found[$item][] = $path;
            }
        }
    }
}

searchFiles($searchRoot, $filenames, $found);

echo json_encode([
    'search_root' => $searchRoot,
    'filenames_searched' => $filenames,
    'results' => $found,
    'summary' => count($found) . " de " . count($filenames) . " archivos encontrados."
], JSON_PRETTY_PRINT);
?>
