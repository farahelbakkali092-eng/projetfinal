<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Repositories\ProductRepository;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use App\Http\Requests\Products\ProductRequest;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Section;
use App\Models\ProductImage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Intervention\Image\Laravel\Facades\Image;

class ProductController extends Controller
{
    use ApiResponseTrait;

    protected $productRepository;

    public function __construct(ProductRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * List products with filters
     */
    public function index(Request $request)
    {
        $products = $this->productRepository->search($request->all());
        return $this->successResponse($products, 'Products retrieved successfully');
    }

    /**
     * Get best selling products
     */
    public function bestSellers(Request $request)
    {
       $limit = $request->input('limit', 8);
        $products = $this->productRepository->bestSellers($limit);
        return $this->successResponse($products, 'Best selling products retrieved successfully');
    }

    /**
     * Get products on sale
     */
    public function onSale(Request $request)
    {
       $limit = $request->input('limit', 8);
        $products = $this->productRepository->onSale($limit);
        return $this->successResponse($products, 'On sale products retrieved successfully');
    }

    /**
     * Show single product
     */
    public function show($id)
    {
        $product = $this->productRepository->find($id);
        
        if (!$product) {
            return $this->errorResponse('Product not found', 404);
        }

        // CORRECTION : J'ai retirÃ© 'skinType' et 'ingredients' qui n'existent plus
        return $this->successResponse($product->load(['category', 'brand', 'images']), 'Product retrieved successfully');
    }

    /**
     * Store a product image: resize to 800x800 WebP + thumbnail 400x400
     * Falls back to direct storage if GD/Intervention Image is unavailable.
     */
    private function storeProductImage($file, $product, $isMain = false): void
    {
        $webpFull  = null;
        $webpThumb = null;

        if (extension_loaded('gd')) {
            try {
                $baseName = 'products/' . Str::uuid();

                // Full image â€” max 800x800, WebP quality 80
                $img = Image::read($file);
                $img->scaleDown(800, 800);
                $webpFull = $baseName . '.webp';
                Storage::disk('public')->put($webpFull, $img->toWebp(80));

                // Thumbnail â€” 400x400 cover crop, WebP quality 75
                $imgThumb = Image::read($file);
                $imgThumb->cover(400, 400);
                $webpThumb = $baseName . '_thumb.webp';
                Storage::disk('public')->put($webpThumb, $imgThumb->toWebp(75));
            } catch (\Throwable $e) {
                // WebP conversion failed â€” fall through to direct storage
                \Log::warning('Image WebP conversion failed, storing original: ' . $e->getMessage());
                $webpFull  = null;
                $webpThumb = null;
            }
        }

        // Fallback: store original file as-is
        if (!$webpFull) {
            $webpFull = $file->store('products', 'public');
        }

        $product->images()->create([
            'image_path' => $webpFull,
            'thumb_path' => $webpThumb,
            'is_main'    => $isMain,
        ]);
    }

    /**
     * Download a remote image, compress it, and store it as a product image.
     * Performance-first: all images are resized to 800Ã—800 (WebP) + 400Ã—400 thumb.
     * Never throws â€” returns false and logs on any failure.
     */
    private function downloadAndStoreImageFromUrl(string $url, $product, bool $isMain = false): bool
    {
        // 1. Validate URL format quickly
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            Log::warning("CSV Import â€” invalid image URL skipped: {$url}");
            return false;
        }

        $tmpPath = null;
        try {
            // 2. Download with a strict 10-second timeout to avoid hanging the import
            $context = stream_context_create([
                'http' => [
                    'timeout'        => 10,
                    'follow_location' => true,
                    'max_redirects'  => 3,
                    'user_agent'     => 'Mozilla/5.0 (compatible; ProductImporter/1.0)',
                ],
                'https' => [
                    'timeout'        => 10,
                    'follow_location' => true,
                    'max_redirects'  => 3,
                    'user_agent'     => 'Mozilla/5.0 (compatible; ProductImporter/1.0)',
                ],
            ]);

            $imageData = @file_get_contents($url, false, $context);

            if ($imageData === false || strlen($imageData) < 100) {
                Log::warning("CSV Import â€” could not download image from: {$url}");
                return false;
            }

            // 3. Validate it is a real image (check MIME via fileinfo)
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mime  = $finfo->buffer($imageData);

            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!in_array($mime, $allowedMimes, true)) {
                Log::warning("CSV Import â€” not a valid image MIME ({$mime}) from: {$url}");
                return false;
            }

            // 4. Write to a temp file so Intervention Image can read it
            $ext     = match($mime) {
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif',
                default      => 'jpg',
            };
            $tmpPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . Str::uuid() . '.' . $ext;
            file_put_contents($tmpPath, $imageData);
            unset($imageData); // free memory immediately

            // 5. Create a fake UploadedFile-like object Intervention Image can accept
            //    We pass the tmp path directly since Image::read() accepts file paths.
            $baseName  = 'products/' . Str::uuid();
            $webpFull  = null;
            $webpThumb = null;

            if (extension_loaded('gd')) {
                try {
                    $img = Image::read($tmpPath);
                    $img->scaleDown(800, 800);
                    $webpFull = $baseName . '.webp';
                    Storage::disk('public')->put($webpFull, $img->toWebp(80));

                    $imgThumb = Image::read($tmpPath);
                    $imgThumb->cover(400, 400);
                    $webpThumb = $baseName . '_thumb.webp';
                    Storage::disk('public')->put($webpThumb, $imgThumb->toWebp(75));
                } catch (\Throwable $e) {
                    Log::warning('CSV Import â€” WebP conversion failed, storing original: ' . $e->getMessage());
                    $webpFull  = null;
                    $webpThumb = null;
                }
            }

            // Fallback: store raw file if WebP processing failed
            if (!$webpFull) {
                $webpFull = $baseName . '.' . $ext;
                Storage::disk('public')->put($webpFull, file_get_contents($tmpPath));
            }

            $product->images()->create([
                'image_path' => $webpFull,
                'thumb_path' => $webpThumb,
                'is_main'    => $isMain,
            ]);

            return true;

        } catch (\Throwable $e) {
            Log::error("CSV Import â€” unexpected error processing image {$url}: " . $e->getMessage());
            return false;
        } finally {
            // Always clean up the temp file
            if ($tmpPath && file_exists($tmpPath)) {
                @unlink($tmpPath);
            }
        }
    }

    /**
     * Create product (Admin only)
     */
    public function store(ProductRequest $request)
    {
        $product = $this->productRepository->create($request->validated());

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $this->storeProductImage($image, $product, $index === 0);
            }
        }

        return $this->successResponse($product->load(['images']), 'Product created successfully', 201);
    }

    /**
     * Update product (Admin only)
     */
    public function update(ProductRequest $request, $id)
    {
        $product = $this->productRepository->find($id);
        
        if (!$product) {
            return $this->errorResponse('Product not found', 404);
        }

        $product->update($request->validated());

        if ($request->hasFile('images')) {
            $hasMain = $product->images()->where('is_main', true)->exists();
            foreach ($request->file('images') as $index => $image) {
                $this->storeProductImage($image, $product, !$hasMain && $index === 0);
            }
        }

        return $this->successResponse($product->load(['images']), 'Product updated successfully');
    }

    /**
     * Delete product (Admin only)
     */
    public function destroy($id)
    {
        $deleted = $this->productRepository->delete($id);
        
        if (!$deleted) {
            return $this->errorResponse('Product not found', 404);
        }
        
        return $this->successResponse(null, 'Product deleted successfully');
    }

    /**
     * Delete a single product image (Admin only)
     */
    public function destroyImage($imageId)
    {
        $image = ProductImage::find($imageId);

        if (!$image) {
            return $this->errorResponse('Image not found', 404);
        }

        // Delete full image from disk
        if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        // Delete thumbnail from disk if it exists
        if ($image->thumb_path && Storage::disk('public')->exists($image->thumb_path)) {
            Storage::disk('public')->delete($image->thumb_path);
        }

        $image->delete();

        return $this->successResponse(null, 'Image deleted successfully');
    }

    /**
     * Bulk import products from CSV (Admin only)
     */
    public function bulkImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        try {
            $file = $request->file('file');
            $path = $file->getRealPath();
            
            $fileHandle = fopen($path, 'r');
            if ($fileHandle === false) {
                return $this->errorResponse('Cannot read CSV file', 422);
            }
            
            // Handle UTF-8 BOM if present
            $headerLine = fgets($fileHandle);
            if ($headerLine !== false) {
                if (str_starts_with($headerLine, "\xEF\xBB\xBF")) {
                    $headerLine = substr($headerLine, 3);
                }
                $header = str_getcsv($headerLine);
            } else {
                return $this->errorResponse('Empty CSV file', 422);
            }

            if (!$header) {
                return $this->errorResponse('Invalid CSV header', 422);
            }
            $header = array_map(fn($h) => trim($h, " \t\n\r\0\x0B\"'"), $header);

            $imported = 0;
            $errors = [];
            $index = 0;

            while (($row = fgetcsv($fileHandle)) !== false) {
                $index++;
                if (count($row) < count($header)) continue;
                
                $item = array_combine($header, array_slice($row, 0, count($header)));
                $item = array_map(fn($v) => trim($v, " \t\n\r\0\x0B\"'"), $item);

                try {
                    $catName   = $item['category']  ?? ($item['catÃ©gorie'] ?? '');
                    $brandName = $item['brand']      ?? ($item['marque']   ?? '');
                    $secName   = $item['section']    ?? '';

                    $category = Category::where('name', 'ILIKE', $catName)->first()
                                ?? Category::where('name', $catName)->first();
                    $brand    = Brand::where('name', 'ILIKE', $brandName)->first()
                                ?? Brand::where('name', $brandName)->first();
                    
                    $section = null;
                    if (!empty($secName)) {
                        $section = Section::where('name', 'ILIKE', $secName)->first()
                                   ?? Section::where('name', $secName)->first();
                    }

                    if (!$category || !$brand) {
                        $missing = [];
                        if (!$category) $missing[] = "Category '$catName'";
                        if (!$brand)    $missing[] = "Brand '$brandName'";
                        $errors[] = "Row {$index}: " . implode(' and ', $missing) . " not found.";
                        continue;
                    }

                    $name = $item['name'] ?? ($item['nom'] ?? 'Unnamed Product');

                    $productData = [
                        'name'        => $name,
                        'slug'        => Str::slug($name) . '-' . rand(1000, 9999),
                        'description' => $item['description'] ?? '',
                        'price'       => floatval(str_replace(',', '.', $item['price'] ?? 0)),
                        'stock'       => intval($item['stock'] ?? 0),
                        'category_id' => $category->id,
                        'brand_id'    => $brand->id,
                        'section_id'  => $section ? $section->id : null,
                        'price_sold'  => (!empty($item['price_sold']) && $item['price_sold'] !== '') ? floatval(str_replace(',', '.', $item['price_sold'])) : null,
                        'discount'    => (!empty($item['discount'])   && $item['discount']   !== '') ? intval($item['discount']) : 0,
                        'capacity'    => !empty($item['capacity'])  ? $item['capacity']  : null,
                        'reference'   => !empty($item['reference'])  ? $item['reference']  : null,
                    ];

                    $product = $this->productRepository->create($productData);
                    $imported++;

                    // â”€â”€ Image download (non-blocking) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    $imageUrl = trim($item['image_url'] ?? '');
                    if (!empty($imageUrl)) {
                        $imgOk = $this->downloadAndStoreImageFromUrl($imageUrl, $product, true);
                        if (!$imgOk) {
                            $errors[] = "Row {$index}: produit crÃ©Ã©, mais l'image n'a pas pu Ãªtre tÃ©lÃ©chargÃ©e ({$imageUrl})";
                        }
                    }
                } catch (\Throwable $e) {
                    // Catch both Exception and Error (TypeError, etc.) per row
                    Log::error("CSV import row {$index} failed: " . $e->getMessage());
                    $errors[] = "Row {$index}: " . $e->getMessage();
                }
            }
            fclose($fileHandle);

            return $this->successResponse([
                'imported'        => $imported,
                'total_processed' => $index,
                'errors'          => $errors,
            ], 'Import completed: ' . $imported . ' products added.');

        } catch (\Throwable $e) {
            // Top-level safety net â€” ensures a JSON response is ALWAYS returned
            // so CORS headers are never stripped by an uncaught exception.
            Log::error('CSV bulkImport fatal error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->errorResponse('Import failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Regenerate placeholder images for products without images (Admin only).
     * POST /api/v1/admin/products/fix-images
     */
    public function fixImages(Request $request)
    {
        if (!extension_loaded('gd')) {
            return $this->errorResponse('Extension PHP GD non disponible sur ce serveur.', 422);
        }

        $all = $request->boolean('all', false); // ?all=1 regenerates even products that already have images

        try {
            $query = \App\Models\Product::with('category');
            if (!$all) {
                $query->doesntHave('images');
            }
            $products = $query->get();
            $total    = $products->count();

            if ($total === 0) {
                return $this->successResponse(['generated' => 0, 'failed' => 0], 'Tous les produits ont déjà une image.');
            }

            $generated = 0;
            $failed    = 0;
            $errors    = [];

            foreach ($products as $product) {
                try {
                    $this->generatePlaceholderForProduct($product);
                    $generated++;
                } catch (\Throwable $e) {
                    $failed++;
                    $errors[] = "Produit #{$product->id}: " . $e->getMessage();
                    Log::warning("fixImages: Échec produit #{$product->id}: " . $e->getMessage());
                }
            }

            return $this->successResponse([
                'total'     => $total,
                'generated' => $generated,
                'failed'    => $failed,
                'errors'    => $errors,
            ], "{$generated} images générées sur {$total} produits.");

        } catch (\Throwable $e) {
            Log::error('fixImages fatal: ' . $e->getMessage());
            return $this->errorResponse('Erreur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generate a 600×600 PNG placeholder using GD and store it for the given product.
     */
    private function generatePlaceholderForProduct($product): void
    {
        $categoryColors = [
            'soin du visage' => ['bg' => 'e8b4b8', 'text' => '6b2737'],
            'soins visage'   => ['bg' => 'e8b4b8', 'text' => '6b2737'],
            'corps'          => ['bg' => 'c3e6cb', 'text' => '1d4d2e'],
            'soin corps'     => ['bg' => 'c3e6cb', 'text' => '1d4d2e'],
            'cheveux'        => ['bg' => 'd4b8e0', 'text' => '4a1f6b'],
            'soin cheveux'   => ['bg' => 'd4b8e0', 'text' => '4a1f6b'],
            'maquillage'     => ['bg' => 'f9c6d0', 'text' => '8b0032'],
            'make-up'        => ['bg' => 'f9c6d0', 'text' => '8b0032'],
            'solaire'        => ['bg' => 'fff3c4', 'text' => '7a5c00'],
            'parfum'         => ['bg' => 'b8d4e8', 'text' => '1a3a5c'],
            'fragrance'      => ['bg' => 'b8d4e8', 'text' => '1a3a5c'],
            'sérum'          => ['bg' => 'ffd1dc', 'text' => '8b3a3a'],
        ];

        $catName = strtolower(trim($product->category->name ?? ''));
        $palette = ['bg' => 'b5c0d0', 'text' => '2c3e50'];
        foreach ($categoryColors as $key => $p) {
            if (str_contains($catName, $key)) {
                $palette = $p;
                break;
            }
        }

        $hexToRgb = fn(string $h) => [hexdec(substr($h, 0, 2)), hexdec(substr($h, 2, 2)), hexdec(substr($h, 4, 2))];

        $width  = 600;
        $height = 600;
        $img    = imagecreatetruecolor($width, $height);

        [$bgR, $bgG, $bgB] = $hexToRgb($palette['bg']);
        [$tR, $tG, $tB]    = $hexToRgb($palette['text']);

        $bgColor    = imagecolorallocate($img, $bgR, $bgG, $bgB);
        $textColor  = imagecolorallocate($img, $tR, $tG, $tB);
        $whiteColor = imagecolorallocate($img, 255, 255, 255);

        imagefill($img, 0, 0, $bgColor);

        // Decorative soft circle
        $circleC = imagecolorallocatealpha($img, $tR, $tG, $tB, 110);
        imagefilledellipse($img, $width / 2, $height / 2, 420, 420, $circleC);

        // Try to find a TTF font
        $fontPath = null;
        foreach ([
            'C:/Windows/Fonts/arial.ttf',
            'C:/Windows/Fonts/calibri.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        ] as $fp) {
            if (file_exists($fp)) { $fontPath = $fp; break; }
        }

        $name    = mb_strlen($product->name) > 30 ? mb_substr($product->name, 0, 29) . '…' : $product->name;
        $catDisp = strtoupper($product->category->name ?? 'BEAUTÉ');

        if ($fontPath && function_exists('imagettftext')) {
            $bboxCat = imagettfbbox(18, 0, $fontPath, $catDisp);
            $catW    = abs($bboxCat[4] - $bboxCat[0]);
            imagettftext($img, 18, 0, ($width - $catW) / 2, 230, $textColor, $fontPath, $catDisp);
            imageline($img, $width / 2 - 100, 248, $width / 2 + 100, 248, $textColor);

            // Word-wrap the product name
            $words = explode(' ', $name);
            $lines = [];
            $cur   = '';
            foreach ($words as $w) {
                $test = $cur === '' ? $w : $cur . ' ' . $w;
                $bb   = imagettfbbox(24, 0, $fontPath, $test);
                if (abs($bb[4] - $bb[0]) > $width - 60 && $cur !== '') {
                    $lines[] = $cur;
                    $cur     = $w;
                } else {
                    $cur = $test;
                }
            }
            if ($cur !== '') $lines[] = $cur;

            $startY = 300 - (count($lines) - 1) * 18;
            foreach ($lines as $i => $l) {
                $bb = imagettfbbox(24, 0, $fontPath, $l);
                imagettftext($img, 24, 0, ($width - abs($bb[4] - $bb[0])) / 2, $startY + $i * 36, $whiteColor, $fontPath, $l);
            }

            $label = 'beautyshop.ma';
            $bb    = imagettfbbox(13, 0, $fontPath, $label);
            imagettftext($img, 13, 0, ($width - abs($bb[4] - $bb[0])) / 2, $height - 40, $textColor, $fontPath, $label);
        } else {
            // Built-in font fallback (always available)
            imagestring($img, 5, 20, 260, $name,    $whiteColor);
            imagestring($img, 3, 20, 300, $catDisp, $textColor);
        }

        // Capture PNG bytes
        ob_start();
        imagepng($img, null, 6);
        $pngData = ob_get_clean();
        imagedestroy($img);

        // Generate 400×400 thumbnail
        $src   = imagecreatefromstring($pngData);
        $thumb = imagecreatetruecolor(400, 400);
        imagecopyresampled($thumb, $src, 0, 0, 0, 0, 400, 400, 600, 600);
        ob_start();
        imagepng($thumb, null, 6);
        $thumbData = ob_get_clean();
        imagedestroy($thumb);
        imagedestroy($src);

        $base = 'products/' . Str::uuid();
        Storage::disk('public')->put($base . '.png',       $pngData);
        Storage::disk('public')->put($base . '_thumb.png', $thumbData);

        $product->images()->create([
            'image_path' => $base . '.png',
            'thumb_path' => $base . '_thumb.png',
            'is_main'    => true,
        ]);
    }
}
