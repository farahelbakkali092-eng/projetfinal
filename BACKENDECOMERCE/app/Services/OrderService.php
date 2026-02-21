<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class OrderService
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Place a new order
     */
    public function placeOrder(User $user, array $data)
    {
        return DB::transaction(function () use ($user, $data) {
            $totalPrice = 0;
            $items = $data['items'];
            $loadedProducts = []; // <-- On va stocker les produits ici

            // 1. Calculate total and validate stock
            foreach ($items as &$item) {
                $product = Product::findOrFail($item['product_id']);
                
                if (!$this->stockService->hasStock($product, $item['quantity'])) {
                    throw new Exception("Stock insuffisant pour le produit : {$product->name}");
                }

                $item['price'] = $product->price;
                $totalPrice += $product->price * $item['quantity'];
                
                $loadedProducts[$product->id] = $product; // <-- On le garde en mémoire
            }

            // 2. Create Order
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'user_id' => $user->id,
                'total_price' => $totalPrice,
                'status' => 'pending',
                'payment_method' => $data['payment_method'],
                'payment_status' => 'pending',
                'shipping_address' => json_encode($data['shipping_address']) // Attention, souvent un tableau depuis le frontend, il faut le transformer en texte/json
            ]);

            // 3. Create Order Items & Decrement Stock
            foreach ($items as $item) {
                $product = $loadedProducts[$item['product_id']]; // <-- On récupère le produit sans refaire de requête SQL !
                
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ]);

                $this->stockService->decrementStock($product, $item['quantity']);
            }

            return $order->load('items.product');
        });
    }
}
