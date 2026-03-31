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
}
