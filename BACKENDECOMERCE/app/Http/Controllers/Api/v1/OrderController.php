<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use App\Http\Requests\Orders\OrderRequest;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Exception;

class OrderController extends Controller
{
    use ApiResponseTrait;

    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Place an order
     */
    public function store(OrderRequest $request)
    {
        try {
            $order = $this->orderService->placeOrder($request->user(), $request->validated());
            return $this->successResponse($order, 'Order placed successfully', 201);
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * List user's orders
     */
    public function index(Request $request)
    {
        $orders = $request->user()->isAdmin() 
            ? \App\Models\Order::with(['user', 'items.product'])->paginate(15)
            : $request->user()->orders()->with('items.product')->paginate(15);

        return $this->successResponse($orders, 'Orders retrieved successfully');
    }

    /**
     * Show order details
     */
    public function show(Request $request, $id)
    {
        $order = \App\Models\Order::with(['user', 'items.product', 'payment'])->find($id);

        if (!$order) {
            return $this->errorResponse('Order not found', 404);
        }

        // Authorization check
        if (!$request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        return $this->successResponse($order);
    }

    /**
     * Update order status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled'
        ]);

        $order = \App\Models\Order::find($id);

        if (!$order) {
            return $this->errorResponse('Order not found', 404);
        }

        $order->update(['status' => $request->status]);

        return $this->successResponse($order, 'Order status updated successfully');
    }
}
