<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Repositories\ProductRepository;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use App\Http\Requests\Products\ProductRequest; 

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
}