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
use Illuminate\Support\Str;

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

        // CORRECTION : J'ai retiré 'skinType' et 'ingredients' qui n'existent plus
        return $this->successResponse($product->load(['category', 'brand', 'images']), 'Product retrieved successfully');
    }

    /**
     * Create product (Admin only)
     */
    public function store(ProductRequest $request)
    {
        // Création des données de base
        $product = $this->productRepository->create($request->validated());
        
        // Gestion des images (Supporte l'upload multiple si le front envoie un tableau 'images')
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                // On suppose que la relation images() existe (table product_images)
                $product->images()->create(['image_path' => $path]);
            }
        }
        // Note : Si votre front envoie une seule image sous le nom 'image', il faudra adapter ici.

        // CORRECTION : Suppression du bloc ingredients

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

        // Handle new images if provided
        if ($request->hasFile('images')) {
            // Logique pour définir l'image principale si elle n'existe pas
            $hasMain = $product->images()->where('is_main', true)->exists();
            $first = true;

            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image_path' => $path,
                    'is_main' => (!$hasMain && $first),
                ]);
                $first = false;
            }
        }

        // CORRECTION : Suppression du bloc ingredients

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
     * Bulk import products from CSV (Admin only)
     */
    public function bulkImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $fileHandle = fopen($path, 'r');
        
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
                $catName = $item['category'] ?? ($item['catégorie'] ?? '');
                $brandName = $item['brand'] ?? ($item['marque'] ?? '');
                $secName = $item['section'] ?? '';

                $category = Category::where('name', 'ILIKE', $catName)->first() 
                            ?? Category::where('name', $catName)->first();
                $brand = Brand::where('name', 'ILIKE', $brandName)->first()
                         ?? Brand::where('name', $brandName)->first();
                
                $section = null;
                if (!empty($secName)) {
                    $section = Section::where('name', 'ILIKE', $secName)->first()
                               ?? Section::where('name', $secName)->first();
                }

                if (!$category || !$brand) {
                    $missing = [];
                    if (!$category) $missing[] = "Category '$catName'";
                    if (!$brand) $missing[] = "Brand '$brandName'";
                    $errors[] = "Row " . ($index + 1) . ": " . implode(' and ', $missing) . " not found.";
                    continue;
                }

                $name = $item['name'] ?? ($item['nom'] ?? 'Unnamed Product');

                $productData = [
                    'name' => $name,
                    'slug' => Str::slug($name) . '-' . rand(1000, 9999),
                    'description' => $item['description'] ?? '',
                    'price' => floatval(str_replace(',', '.', $item['price'] ?? 0)),
                    'stock' => intval($item['stock'] ?? 0),
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'section_id' => $section ? $section->id : null,
                    'price_sold' => (!empty($item['price_sold']) && $item['price_sold'] !== '') ? floatval(str_replace(',', '.', $item['price_sold'])) : null,
                    'discount' => (!empty($item['discount']) && $item['discount'] !== '') ? intval($item['discount']) : 0,
                ];

                $this->productRepository->create($productData);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 1) . ": " . $e->getMessage();
            }
        }
        fclose($fileHandle);

        return $this->successResponse([
            'imported' => $imported,
            'total_processed' => $index,
            'errors' => $errors
        ], 'Import completed: ' . $imported . ' products added.');
    }
}