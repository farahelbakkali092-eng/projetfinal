<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FixProductImages extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'products:fix-images
                            {--dry-run : Show what would be done without making changes}
                            {--all : Regenerate images even for products that already have one}';

    /**
     * The console command description.
     */
    protected $description = 'Generate placeholder images (PNG via GD) for products missing images.';

    /**
     * Category → background colour map (hex without #).
     * Products whose category is not listed fall back to #6c757d (grey).
     */
    private array $categoryColors = [
        // Skincare / Visage
        'soin du visage'      => ['bg' => 'e8b4b8', 'text' => '6b2737'],
        'soins visage'        => ['bg' => 'e8b4b8', 'text' => '6b2737'],
        'crème'               => ['bg' => 'f7cac9', 'text' => '8b3a3a'],
        'sérum'               => ['bg' => 'ffd1dc', 'text' => '8b3a3a'],
        // Corps
        'corps'               => ['bg' => 'c3e6cb', 'text' => '1d4d2e'],
        'soin corps'          => ['bg' => 'c3e6cb', 'text' => '1d4d2e'],
        // Cheveux
        'cheveux'             => ['bg' => 'd4b8e0', 'text' => '4a1f6b'],
        'soin cheveux'        => ['bg' => 'd4b8e0', 'text' => '4a1f6b'],
        // Maquillage
        'maquillage'          => ['bg' => 'f9c6d0', 'text' => '8b0032'],
        'make-up'             => ['bg' => 'f9c6d0', 'text' => '8b0032'],
        // Solaire
        'solaire'             => ['bg' => 'fff3c4', 'text' => '7a5c00'],
        'sun care'            => ['bg' => 'fff3c4', 'text' => '7a5c00'],
        // Parfum
        'parfum'              => ['bg' => 'b8d4e8', 'text' => '1a3a5c'],
        'fragrance'           => ['bg' => 'b8d4e8', 'text' => '1a3a5c'],
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (!extension_loaded('gd')) {
            $this->error('La bibliothèque PHP GD n\'est pas chargée. Impossible de générer des images.');
            return self::FAILURE;
        }

        $all    = $this->option('all');
        $dryRun = $this->option('dry-run');

        $query = Product::with('category');
        if (!$all) {
            $query->doesntHave('images');
        }

        $products = $query->get();

        if ($products->isEmpty()) {
            $this->info('Aucun produit à traiter.');
            return self::SUCCESS;
        }

        $this->info("Produits à traiter : {$products->count()}");
        $bar = $this->output->createProgressBar($products->count());
        $bar->start();

        $generated = 0;
        $failed    = 0;

        foreach ($products as $product) {
            $bar->advance();

            if ($dryRun) {
                $this->line('  [DRY] Would generate image for: ' . $product->name);
                continue;
            }

            try {
                $this->generateImageForProduct($product);
                $generated++;
            } catch (\Throwable $e) {
                $failed++;
                $this->newLine();
                $this->warn("  Échec pour produit #{$product->id} ({$product->name}): " . $e->getMessage());
            }
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✅  Images générées : {$generated}");
        if ($failed) {
            $this->warn("⚠️  Échecs : {$failed}");
        }

        return self::SUCCESS;
    }

    /**
     * Generate a 600×600 PNG placeholder for the given product and attach it.
     */
    private function generateImageForProduct(Product $product): void
    {
        $catName = strtolower(trim($product->category->name ?? ''));
        $palette = $this->resolveColor($catName);

        $bgHex   = $palette['bg'];
        $textHex = $palette['text'];

        $width  = 600;
        $height = 600;

        // Create image canvas
        $image = imagecreatetruecolor($width, $height);

        // Background color
        [$bgR, $bgG, $bgB] = $this->hexToRgb($bgHex);
        $bgColor = imagecolorallocate($image, $bgR, $bgG, $bgB);
        imagefill($image, 0, 0, $bgColor);

        // Subtle gradient overlay: draw horizontal strips with slightly lighter shade at top
        for ($y = 0; $y < $height; $y++) {
            $factor = 1 - ($y / $height) * 0.15;
            $r = (int) min(255, $bgR * $factor + 255 * (1 - $factor) * 0.3);
            $g = (int) min(255, $bgG * $factor + 255 * (1 - $factor) * 0.3);
            $b = (int) min(255, $bgB * $factor + 255 * (1 - $factor) * 0.3);
            $lineColor = imagecolorallocatealpha($image, max(0, $r), max(0, $g), max(0, $b), 60);
            imageline($image, 0, $y, $width, $y, $lineColor);
        }

        // Decorative circle in center background
        [$tR, $tG, $tB] = $this->hexToRgb($textHex);
        $circleColor = imagecolorallocatealpha($image, $tR, $tG, $tB, 110);
        imagefilledellipse($image, $width / 2, $height / 2, 420, 420, $circleColor);

        // --- Text: product name ---
        [$tR, $tG, $tB] = $this->hexToRgb($textHex);
        $textColor  = imagecolorallocate($image, $tR, $tG, $tB);
        $whiteColor = imagecolorallocate($image, 255, 255, 255);

        $fontPath = $this->getFontPath();

        $name = $this->truncateText($product->name, 28);
        $catDisplay = strtoupper($product->category->name ?? 'Produit');

        if ($fontPath && function_exists('imagettftext')) {
            // Category label (smaller, top center)
            $catFontSize = 18;
            $bbox = imagettfbbox($catFontSize, 0, $fontPath, $catDisplay);
            $catW = abs($bbox[4] - $bbox[0]);
            imagettftext($image, $catFontSize, 0, ($width - $catW) / 2, 220, $textColor, $fontPath, $catDisplay);

            // Divider line
            $lineColor2 = imagecolorallocate($image, $tR, $tG, $tB);
            imageline($image, ($width / 2) - 100, 240, ($width / 2) + 100, 240, $lineColor2);

            // Product name (larger, center)
            $nameFontSize = 26;
            $lines = $this->wrapText($name, $nameFontSize, $fontPath, $width - 60);
            $lineHeight = $nameFontSize + 12;
            $startY = 280 - (count($lines) - 1) * $lineHeight / 2;

            foreach ($lines as $i => $line) {
                $bboxLine = imagettfbbox($nameFontSize, 0, $fontPath, $line);
                $lineW    = abs($bboxLine[4] - $bboxLine[0]);
                imagettftext($image, $nameFontSize, 0, ($width - $lineW) / 2, $startY + $i * $lineHeight + 40, $whiteColor, $fontPath, $line);
            }

            // Brand/bottom label
            $bottomLabel = 'www.beautyshop.ma';
            $bboxB = imagettfbbox(13, 0, $fontPath, $bottomLabel);
            $bW    = abs($bboxB[4] - $bboxB[0]);
            imagettftext($image, 13, 0, ($width - $bW) / 2, $height - 40, $textColor, $fontPath, $bottomLabel);
        } else {
            // Fallback to built-in font (no TTF)
            $font = 5; // largest built-in
            imagestring($image, $font, 20, 260, $name, $whiteColor);
            imagestring($image, 3, 20, 300, $catDisplay, $textColor);
        }

        // Output PNG to a temp buffer, then store
        ob_start();
        imagepng($image, null, 6);
        $pngData = ob_get_clean();
        imagedestroy($image);

        $baseName = 'products/' . Str::uuid();
        $fullPath = $baseName . '.png';

        Storage::disk('public')->put($fullPath, $pngData);

        // Also generate a 400×400 thumb
        $thumbImg = imagecreatefrompng('data://image/png;base64,' . base64_encode($pngData));
        $thumb    = imagecreatetruecolor(400, 400);
        imagecopyresampled($thumb, $thumbImg, 0, 0, 0, 0, 400, 400, $width, $height);
        ob_start();
        imagepng($thumb, null, 6);
        $thumbData = ob_get_clean();
        imagedestroy($thumb);
        imagedestroy($thumbImg);

        $thumbPath = $baseName . '_thumb.png';
        Storage::disk('public')->put($thumbPath, $thumbData);

        // Store only if product has no main image (or --all was used)
        $product->images()->create([
            'image_path' => $fullPath,
            'thumb_path' => $thumbPath,
            'is_main'    => true,
        ]);
    }

    /**
     * Resolve a color palette for a category name.
     */
    private function resolveColor(string $catName): array
    {
        foreach ($this->categoryColors as $key => $palette) {
            if (str_contains($catName, $key)) {
                return $palette;
            }
        }

        // Default beautiful blush palette
        return ['bg' => 'b5c0d0', 'text' => '2c3e50'];
    }

    /**
     * Hex string → [R, G, B].
     */
    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];
    }

    /**
     * Attempt to locate a TTF font bundled with the project or system.
     */
    private function getFontPath(): ?string
    {
        $candidates = [
            // Windows
            'C:/Windows/Fonts/arial.ttf',
            'C:/Windows/Fonts/calibri.ttf',
            'C:/Windows/Fonts/verdana.ttf',
            // Linux
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
            '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
            // MacOS
            '/Library/Fonts/Arial.ttf',
            '/System/Library/Fonts/Helvetica.ttc',
            // Project local font (optional)
            base_path('resources/fonts/Roboto-Regular.ttf'),
        ];

        foreach ($candidates as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Truncate text to max $length chars.
     */
    private function truncateText(string $text, int $length): string
    {
        return mb_strlen($text) > $length ? mb_substr($text, 0, $length - 1) . '…' : $text;
    }

    /**
     * Wrap text into lines that fit within $maxPixelWidth using imagettfbbox.
     */
    private function wrapText(string $text, int $fontSize, string $fontPath, int $maxPixelWidth): array
    {
        $words = explode(' ', $text);
        $lines = [];
        $current = '';

        foreach ($words as $word) {
            $test = $current === '' ? $word : $current . ' ' . $word;
            $bbox = imagettfbbox($fontSize, 0, $fontPath, $test);
            $w    = abs($bbox[4] - $bbox[0]);
            if ($w > $maxPixelWidth && $current !== '') {
                $lines[] = $current;
                $current = $word;
            } else {
                $current = $test;
            }
        }
        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines ?: [''];
    }
}
