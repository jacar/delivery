<?php
$oldPath = '../src/fotogramas';
$newPath = 'fotogramas';

if (is_dir($oldPath)) {
    if (!is_dir($newPath)) {
        if (rename($oldPath, $newPath)) {
            echo "SUCCESS: Moved $oldPath to $newPath";
        } else {
            echo "ERROR: Failed to move directory.";
        }
    } else {
        echo "ERROR: Target directory $newPath already exists. Maybe delete it first if you want to replace it.";
    }
} else {
    echo "ERROR: Source directory $oldPath not found.";
}
?>
