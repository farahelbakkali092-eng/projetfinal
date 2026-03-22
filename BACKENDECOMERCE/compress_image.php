<?php

$source = 'c:/Users/pc/versionfinaldepfe/pfefinal-main/frontendd/src/assets/foto1.jpg';
$destination = 'c:/Users/pc/versionfinaldepfe/pfefinal-main/frontendd/src/assets/foto1_compressed.jpg';

if (!file_exists($source)) {
    die("Source file not found: $source\n");
}

echo "Loading image: $source\n";
$image = @imagecreatefromjpeg($source);

if (!$image) {
    die("Failed to load image. GD might not be enabled or file is invalid.\n");
}

echo "Saving compressed image: $destination\n";
// Quality 70 is a good balance for web
if (imagejpeg($image, $destination, 70)) {
    echo "Success! Compressed to " . number_format(filesize($destination) / 1024, 2) . " KB\n";
    imagedestroy($image);
    
    // Backup and replace
    $backup = $source . '.bak';
    rename($source, $backup);
    rename($destination, $source);
    echo "Replaced original with compressed version. Backup saved as .bak\n";
} else {
    echo "Failed to save compressed image.\n";
    imagedestroy($image);
}
